const md = require("markdown-it")();
const TableBuilder = require("nd-table").Table;
const groupBy = require("group-by");
const stringMath = require("string-math");

const RE_VARIABLE_SUBSTITUTE = /{[^}]+}/g;
const RE_AGGREGATED_VALUE = /^(SUM|AVG|MIN|MAX|CNT|ANY)\((.*)\)/;

const sum = (values) => values.reduce((a, b) => a + (b || 0), 0);

const AGGREGATORS = {
  MIN: Math.min,
  MAX: Math.max,
  CNT: (values) => values.length,
  SUM: sum,
  AVG: (values) => sum(values) / values.length,
};

const sliceByTokenTypes = (tokens, startType, endType) => {
  const sliced = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === startType) {
      for (let j = i; j < tokens.length; j++) {
        const nextToken = tokens[j];
        if (nextToken.type === endType) {
          sliced.push(tokens.slice(i, j + 1));
          i = j;
          break;
        }
      }
    }
  }
  return sliced;
};

const toTable = (tokens) => {
  let isPivotTable = false;
  let foundAggregatedColumn = false;

  const columns = sliceByTokenTypes(tokens, "th_open", "th_close").map(
    (column_tokens, i) => {
      const content = column_tokens[1].content.trim();
      const containsEqual = content.includes("="); // TODO: consider validations for multiple equal signs.

      if (containsEqual) {
        isPivotTable = true;
        const [left, right] = content.split("=").map((s) => s.trim());

        if (!left || !right) {
          throw new Error(
            "There should be a non-empty string on either side of the equal sign"
          );
        }

        const match = right.match(RE_AGGREGATED_VALUE);
        if (match) {
          foundAggregatedColumn = true;
          return {
            index: i,
            type: "aggregated",
            name: left,
            aggregator: match[1],
            equation: match[2],
          };
        }

        return {
          index: i,
          type: left.toLowerCase(),
          name: right,
        };
      }

      return {
        index: i,
        type: "regular",
        name: content,
      };
    }
  );

  const tbodyTokens = sliceByTokenTypes(tokens, "tbody_open", "tbody_close")[0];
  const rowTokens = sliceByTokenTypes(tbodyTokens, "tr_open", "tr_close");
  const rows = rowTokens.map((rowToken) =>
    sliceByTokenTypes(rowToken, "td_open", "td_close").flatMap(
      (cellTokens) => cellTokens[1].content
    )
  );

  if (!isPivotTable || !foundAggregatedColumn) {
    return {
      isPivotTable,
    };
  }

  const columnMap = columns.reduce((acc, next) => {
    acc[next.name] = next;
    return acc;
  }, {});
  const visitedColumns = [];
  const getCellValue = (row, column) => {
    let cellValue = row[column.index] || column.equation;
    if (cellValue) {
      const match = cellValue.match(RE_VARIABLE_SUBSTITUTE);
      if (match) {
        match.forEach((columnName) => {
          const sanitizedColumnName = columnName.replace(/[{}]/g, "");
          if (!visitedColumns.includes(sanitizedColumnName)) {
            const nextValue = getCellValue(row, columnMap[sanitizedColumnName]);
            cellValue = cellValue.replace(columnName, nextValue);
          }
        });
      }
    }

    row[column.index] = cellValue;
    return cellValue;
  };

  rows.forEach((row) => {
    for (let i = 0; i < columns.length; i++) {
      getCellValue(row, columns[i]);
    }
  });

  return {
    isPivotTable,
    columns,
    visibleColumns: columns.filter((col) => col.type !== "regular"),
    rows,
    tokens: {
      open: tokens[0],
      close: tokens[tokens.length - 1],
    },
  };
};

const generateTableTokens = (table) => {
  const aggregate = (rows) =>
    table.visibleColumns.map((column) => {
      if (column.type === "group") {
        // return the cell value of the first row
        return rows[0][column.index];
      } else if (column.type === "aggregated") {
        if (column.aggregator === "ANY") {
          return rows
            .map((row) => row[column.index] || "")
            .find((value) => value.trim());
        }
        const individualValues = rows.map((row) => {
          const cellValue = row[column.index];
          if (cellValue) {
            return stringMath(cellValue);
          }
        });
        return AGGREGATORS[column.aggregator](individualValues).toFixed(2);
      }
    });

  const groups = Object.values(
    groupBy(table.rows, (row) =>
      table.visibleColumns
        .filter((column) => column.type === "group")
        .map((column) => row[column.index])
        .join(":")
    )
  );

  const tableBuilder = TableBuilder.fromData(
    [table.visibleColumns.map((col) => col.name), ...groups.map(aggregate)],
    true // this indicates that the first row is the column header.
  );

  const stringified = tableBuilder.toMarkdown();
  const tokens = md.parse(stringified);
  return tokens;
};

const update = (tokens, table) => {
  const newTokens = generateTableTokens(table);
  const openTokenIndex = tokens.findIndex(
    (token) => token === table.tokens.open
  );
  const closeTokenIndex = tokens.findIndex(
    (token) => token === table.tokens.close
  );
  const deleteCount = closeTokenIndex - openTokenIndex + 1;
  tokens.splice(openTokenIndex, deleteCount, ...newTokens);
};

const usePivotTable = (md) => {
  md.core.ruler.push("pivot_table", (state) => {
    const { tokens } = state;
    sliceByTokenTypes(tokens, "table_open", "table_close")
      .map(toTable)
      .filter((table) => table.isPivotTable)
      .forEach((table) => update(tokens, table));
  });
};

module.exports = usePivotTable;
