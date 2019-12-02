"use strict";

let data_loc = 'https://raw.githubusercontent.com/skyetim/citywide_mobility_survey/master/dashboard/mobility_general.json';
let debug_mode = true;

let genderMapping = (item) =>{
    let syntax = {
        1 : "Male",
        2 : "Female",
        3 : "Other",
        4 : "Other"
    };
    return syntax[item];
}

let ageMapping = function(item){
    if (item <=24) {
        return '19-24'
    } else if (item <= 54) {
        return '20-54'
    } else if (item <= 64) {
        return '55-64'
    } else if (item <= 100){
        return '>65'
    } else {
        return 'Refused to answer'
    }
}

let identicalMapping = item => item;

function groupData(cf_data, dimensionColumn, mapping=identicalMapping) {
    let dimension = cf_data.dimension(item => mapping(item[dimensionColumn]));
    let quantity = dimension.group().reduceCount(item => item);
    let result = quantity.all();

    if (debug_mode) {
        console.log(dimensionColumn);
        console.log(result);
    }
    return [dimension, quantity]
}

function createGraphDiv(graphID, divID){
    d3.select(`#${divID}`).append('div').attr("style", 'margin: 15px').attr("id", graphID);
}

function pieChart(cf_data, dimensionColumn, pieChartID, mapping=identicalMapping, divID='filters'){
    createGraphDiv(pieChartID, divID)
    let [dimension, quantity] = groupData(cf_data, dimensionColumn, mapping)
    

    var pie = dc.pieChart(`#${pieChartID}`);
    pie
        .width(200)
        .height(200)
        .innerRadius(50)
        .label(function(d) {
                    return d.key + ': ' + d.value; 
            })
        .dimension(dimension)
        .group(quantity);
    pie.render();
}

function barChart(cf_data, dimensionColumn, barChartID, mapping=identicalMapping, divID='filters', ...barParameters){
    createGraphDiv(barChartID, divID)

    let [dimension, quantity] = groupData(cf_data, dimensionColumn, mapping)


    var chart = dc.barChart(`#${barChartID}`);
    chart
        .width(500)
        .height(200)
        .gap(0)
        .x(d3.scaleOrdinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel(dimensionColumn)
        .yAxisLabel("Count")
        .elasticY(true)
        .dimension(dimension)
        .group(quantity);
    chart.render();
}

d3.json(data_loc).then(crossfilter).then((cf_data)=>{
    pieChart(cf_data, 'qgender', "pie1", genderMapping);
    barChart(cf_data, 'qage', 'pie2', ageMapping)
});