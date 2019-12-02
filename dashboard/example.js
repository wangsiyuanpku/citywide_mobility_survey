"use strict";
// Create crossfilter of our data

let data = [
    {name: "banana", category:"fruit", country:"Martinique", outOfDateQuantity:3, quantity: 12},
	{name: "apple", category:"fruit", country:"Spain", outOfDateQuantity:7, quantity: 9},
	{name: "tomato", category:"vegetable", country:"Spain", outOfDateQuantity:2, quantity: 25}
]

let supermarketItems = crossfilter(data);

// First Dimension

let dimensionCategory = supermarketItems.dimension(item => item.category)
let quantityByCategory = dimensionCategory.group().reduceSum(item => item.quantity)


// Beware, javascript will retromodify firstResult (javascript loves saving things by parameters), you must comment the filter to look at this result etc etc...
const firstResult = quantityByCategory.all()
console.log("First result:")
console.log(firstResult)

// How to filter

/* let dimensionCountry = supermarketItems.dimension(item => item.country)
dimensionCountry.filter("Martinique")

const filteredResult = quantityByCategory.all()
console.log("Second result with filter:")
console.log(filteredResult) */
 
// Remove filter

/* dimensionCountry.filter(null)
const filterRemovedResult = quantityByCategory.all()
console.log("Third result filter removed:")
console.log(filterRemovedResult) */

// Tips and Tricks

// 1: Separate value on distinct conditions
let dimensionCountryAndCategory = supermarketItems.dimension(item => item.country + '_' + item.category)
let quantityByCountryAndCategory = dimensionCountryAndCategory.group().reduceSum(item => item.quantity)

const differentCategoriesResult = quantityByCountryAndCategory.all()
console.log("Result 4 with 2 categories:")
console.log(differentCategoriesResult)

//2: Overall sum
let dimensionTotal = supermarketItems.dimension(item => "total")
let totalQuantity = dimensionTotal.group().reduceSum(item => item.quantity)
 
const overallQuantity = totalQuantity.all()
console.log("Result 5: total quantity")
console.log(overallQuantity)

//3: get a ratio instead of a sum
let outOfDateQuantityByCategory = dimensionCategory.group().reduceSum(item => item.outOfDateQuantity)

const ratioGoodOnOutOfDate = outOfDateQuantityByCategory.all().map((item, index) => {
	let ratio = {}
  ratio.key = item.key
  ratio.value = quantityByCategory.all()[index].value / item.value
  return ratio
})
console.log("Result 6: ratio good on out of date")
console.log(ratioGoodOnOutOfDate)

/*
*
*
*/

// Let's add graphs to our dashboard
var pie1 = dc.pieChart("#pie1");
pie1
    .width(200)
    .height(200)
    .innerRadius(25)
    .label(function(d) {
				return d.key + ': ' + d.value; 
		})
    .dimension(dimensionCategory)
    .group(quantityByCategory);
pie1.render();

var pie2 = dc.pieChart("#pie2");
pie2
    .width(200)
    .height(200)
    .innerRadius(25)
    .dimension(dimensionCountryAndCategory)
    .group(quantityByCountryAndCategory)
pie2.render();

let countryCategory = supermarketItems.dimension(item => item.country);
let outOfDateByCountry = countryCategory.group().reduceSum(item => item.outOfDateQuantity);

console.log(outOfDateByCountry.all());

var chart = dc.barChart("#preference");
chart
	.width(500)
    .height(200)
    .gap(0)
    .x(d3.scaleOrdinal())
    .xUnits(dc.units.ordinal)
    .xAxisLabel("Country")
   	.yAxisLabel("Out of date quantity")
    .elasticY(true)
    .dimension(countryCategory)
    .group(outOfDateByCountry);
chart.render();

