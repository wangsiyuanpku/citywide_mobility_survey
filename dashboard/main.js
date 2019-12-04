"use strict";

let data_loc = 'https://raw.githubusercontent.com/skyetim/citywide_mobility_survey/master/data/mobility_general.json';
let debug_mode = false;

let charts = {};

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
    let quantity = dimension.group().reduceSum(item => item.avgwt);
    let result = quantity.all();

    if (debug_mode) {
        console.log(dimensionColumn);
        console.log(result);
    }
    return [dimension, quantity]
}

function createGraphDiv(graphID, divID, chartID, chartTitle=undefined, colLength=undefined, metaDivID='filters'){
    if (d3.select(`#${divID}`).empty()) {
        d3.select(`#${metaDivID}`)
          .append('div')
          .attr('id', divID)
          .attr('class', 'row')
    }
    let div = d3.select(`#${divID}`)
                .append('div')
                .attr("id", graphID)
                .attr('class', `dc-chart col-${colLength || 'sm'}`); 
    div.append("strong")
        .text(chartTitle || chartID);
    d3.select(`#${chartID}`)
    .append('a')
    .attr('class', 'reset float-sm-right')
    .style('display', 'none')
    .text('reset');
    div.append('div')
        .attr('class', 'clearfix');
}

function bindResetButton(chartID){
    d3.select(`#${chartID}`)
    .select('a')
    .attr('href', `javascript:charts['${chartID}'].filterAll();dc.redrawAll();`);
}
function pieChart(cf_data, dimensionColumn, pieChartID, mapping=identicalMapping, divID='filters', resetButton=true, pieChartParameters={}){
    console.log(pieChartParameters)
    createGraphDiv(pieChartID, divID, pieChartID, pieChartParameters['chartTitle'], pieChartParameters['colLength'])
    let [dimension, quantity] = groupData(cf_data, dimensionColumn, mapping)

    var pie = dc.pieChart(`#${pieChartID}`);
    if (resetButton){
        bindResetButton(pieChartID);
    }
    pie
        .width(180)
        .height(180)
        // .innerRadius(50)
        .label(function(d) {
                    return d.key + ': ' + parseInt(d.value); 
            })
        .dimension(dimension)
        .group(quantity)
    pie.render();
    return pie;
}

function barChart(cf_data, dimensionColumn, barChartID, mapping=identicalMapping, divID='filters', resetButton=true, barChartParameters={}){
    createGraphDiv(barChartID, divID, barChartID, barChartParameters['chartTitle'], barChartParameters['colLength']);
    let [dimension, quantity] = groupData(cf_data, dimensionColumn, mapping)
    var chart = dc.barChart(`#${barChartID}`);
    if (resetButton){
        bindResetButton(barChartID);
    }
    chart
        .width(barChartParameters['width']||500)
        .height(barChartParameters['height']||200)
        .gap(10)
        .x(d3.scaleOrdinal())
        .xUnits(dc.units.ordinal)
        // .xAxisLabel(dimensionColumn)
        .margins({left: 50, right: 30, top: 0, bottom: 40})
        // .yAxisLabel("Count")
        .elasticY(true)
        .dimension(dimension)
        .group(quantity);
    chart.render();
    return chart;
}

d3.json(data_loc).then(crossfilter).then((cf_data)=>{
    charts['Preference'] = barChart(cf_data, 'Mode', "Preference", identicalMapping, 'preference', true, {colLength: 12, width: 1000, height: 250})
    charts['Gender'] = pieChart(cf_data, 'qgender', "Gender", genderMapping, 'row0', true);
    charts['Age'] = barChart(cf_data, 'qage', 'Age', ageMapping, 'row0')
});