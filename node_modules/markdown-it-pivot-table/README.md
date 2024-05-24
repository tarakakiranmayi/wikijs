# markdown-it-pivot-table

A markdown-it plugin to add pivot table support.

## Operators

`CNT()`, `MIN()`, `MAX()`, `SUM()`, and `AVG()` work with numeric values.

`ANY()` works with strings.

## Usage

```js
const mdp = require('markdown-it-pivot-table');
const md = require('markdown-it')().use(mdp);

const source = `
|Group=Item|Cost=SUM()|
|---|---|
|Candies|1.00|
|Chips|3.00|
|Candies|1.00|
|Drinks|2.00|
`;

const result = md.render(source);
console.log(result);
```

Result:

|Item|Cost|
|---|---|
| Candies | 2.00 | 
| Chips   | 3.00 | 
| Drinks  | 2.00 | 

### Computed Cells

Reference column names with curly braces to compute numeric values on the fly:

```
|Group=Category|Group=Sub-category|Item|Unit Cost|Qty|Subtotal=SUM()|
|---|---|---|---|---|---|
|Electrical|Wires|14/2 (/m)|||150|
|Electrical|Wires|10/3 (/m)|||99.80|
|Electrical|Devices|Breakers|29.97|3|{Unit Cost}*{Qty}|
```

Result:

| Category   | Sub-category | Subtotal | 
|------------|--------------|----------| 
| Electrical | Wires        | 249.80   | 
| Electrical | Devices      | 89.91    | 

### In-header Equations

If all rows have the same value for a column, then specify the equation right in the header line and leave the cells blank:

```
|Group=Category|Group=Sub-category|Item|Unit Cost|Qty|Subtotal=SUM({Unit Cost}*{Qty})|
|---|---|---|---|---|---|
|Wall|Drywall|1/2" (/sheet)|17.35|25|
|Wall|Mud|Quickset|15|2|
|Wall|Mud|All Purpose|35|3|
```

Result:

| Category | Sub-category | Subtotal | 
|----------|--------------|----------| 
| Wall     | Drywall      | 433.75   | 
| Wall     | Mud          | 135.00   | 
