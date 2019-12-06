"use strict";

let data_loc = 'https://raw.githubusercontent.com/skyetim/citywide_mobility_survey/master/data/mobility_general.json';
let debug_mode = false;

let charts = {};

const getKey = (obj,val) => Object.keys(obj.syntax).find(key => obj.syntax[key] === val);

let CatagoricalMapping = function(syntax) {
    let _syntax = syntax;
    return {
        get syntax() {return _syntax;}, 
        get(item) {return _syntax[item]},
        getKey(val) {
            return Object.keys(_syntax).find(key => _syntax[key] === val);
        }
    }
}

let identicalMapping = {
    get(item) {return item;}
}

// let ageMapping = {
//     get(item) {
//         if (item <=24) {
//             return '19-24'
//         } else if (item <= 54) {
//             return '20-54'
//         } else if (item <= 64) {
//             return '55-64'
//         } else if (item <= 100){
//             return '>65'
//         } else {
//             return 'Refused to answer'
//         }
//     }
// }

let ageMapping = {
    get(item) {
        if (item <= 30) {
            return '19-29'
        } else if (item >=100){
            return 'Refused to answer';
        } else {
            let digit = parseInt(item/10);
            return `${digit}0-${digit}9`
        }
    }
}

let genderMapping = new CatagoricalMapping({
            1 : "Male",
            2 : "Female",
            3 : "Other",
            4 : "Other"
        })


let raceMapping = new CatagoricalMapping({
        1 : "White",
        2 : "Black",
        3 : "Asian",
        4 : "American Indian",
        5 : "Pacific Islander",
        6 : "Other",
        7 : "2+ Races",
        8 : "Other",
        9 : "Other",
    })

let eduMapping = new CatagoricalMapping({
        1 : "No high school",
        2 : "Some high school",
        3 : "High school",
        4 : "Some college",
        5 : "Associate",
        6 : "Bachelor",
        7 : "Graduate",
        8 : "Other", // Don't know
        9 : "Other"  // "Refused"
    })

let incMapping = new CatagoricalMapping({
        1 : "Less than $14,999",
        2 : "$15,000 - $24,999",
        3 : "$25,000 - $34,999",
        4 : "$35,000 - $49,999",
        5 : "$50,000 - $74,999",
        6 : "$75,000 - $99,999",
        7 : "$100,000 - $149,999",
        8 : "$150,000-$199,999",
        9 : "$200,000 and above",
        10 : "Other", // Don't know
        11 : "Other"  // "Refused"
    })

let binaryMapping = new CatagoricalMapping({
    1 : "Yes",
    2 : "No",
    3 : "Other", // Don't know
    4 : "Other"  // "Refused"
})

let employmentMapping = new CatagoricalMapping({
    1 : "Employed full time",
    2 : "Employed part time",
    3 : "Unemployed",
    4 : "Stay-at-home parent",
    5 : "Volunteer work",
    6 : "Full time student",
    7 : "Part-time student",
    8 : "Retired",
    9 : "Active military service",
    10 : "Other",
    11 : "Other", // Don't know
    12 : "Other"  // "Refused"
})

let timeInNYCMapping = new CatagoricalMapping({
    1 : "Less than 1 year",
    2 : "1 to 3 years",
    3 : "4 to 6 years",
    4 : "6 to 10 years",
    5 : "10 to 20 years",
    6 : "20 to 30 years",
    7 : "30+ years",
    8 : "Other", // Don't know
    9 : "Other"  // "Refused"
})

let marriedMapping = new CatagoricalMapping({
    1 : "Single",
    2 : "Married",
    3 : "Widowed",
    4 : "Divorced",
    5 : "Committed partnership",
    6 : "Other", // Don't know
    7 : "Other"  // "Refused"
})

let freqMapping = new CatagoricalMapping({
    1 : "Daily",
    2 : "Most days",
    3 : "A few times a week",
    4 : "A few times a month",
    5 : "A few times a year",
    6 : "Never",
    7 : "Other", // Don't know
    8 : "Other"  // "Refused"
})

function groupData(cf_data, dimensionColumn, mapping=identicalMapping) {
    let dimension = cf_data.dimension(item => mapping.get(item[dimensionColumn]));
    let quantity = dimension.group().reduceSum(item => item.avgwt);
    let result = quantity.all();

    if (debug_mode) {
        console.log(dimensionColumn);
        console.log(result);
    }
    return [dimension, quantity]
}

function dataCount(cf_data){
    dc.dataCount('#reset-all')
      .crossfilter(cf_data)
      .groupAll(cf_data.groupAll())
      .html({
        some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
            ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
        all: 'All records selected. Please click on the graph to apply filters.'
    });
}

function createGraphDiv(chartID, divID, chartTitle=undefined, colLength=undefined, metaDivID='filters'){
    if (d3.select(`#${divID}`).empty()) {
        d3.select(`#${metaDivID}`)
          .append('div')
          .attr('id', divID)
          .attr('class', 'row')
    }
    let div = d3.select(`#${divID}`)
                .append('div')
                .attr("id", chartID)
                .attr('class', `dc-chart col-sm-${colLength || 4}`); 
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
    createGraphDiv(pieChartID, divID, pieChartParameters['chartTitle'], pieChartParameters['colLength'])
    let [dimension, quantity] = groupData(cf_data, dimensionColumn, mapping)

    var pie = dc.pieChart(`#${pieChartID}`);
    if (resetButton){
        bindResetButton(pieChartID);
    }
    pie
        .width(180)
        .height(180)
        .innerRadius(pieChartParameters['innerRadius'] || 0)
        .label(function(d) {
                    return d.key + ': ' + parseInt(d.value); 
            })
        .dimension(dimension)
        .group(quantity)
    pie.render();
    return pie;
}

function barChart(cf_data, dimensionColumn, barChartID, mapping=identicalMapping, divID='filters', resetButton=true, ordering=false, rotate=false, barChartParameters={}){
    createGraphDiv(barChartID, divID, barChartParameters['chartTitle'], barChartParameters['colLength']);
    let [dimension, quantity] = groupData(cf_data, dimensionColumn, mapping)
    var chart = dc.barChart(`#${barChartID}`);
    if (resetButton){
        bindResetButton(barChartID);
    }
    chart
        .width(barChartParameters['width']||500)
        .height(barChartParameters['height']||200)
        .outerPadding(1)
        .gap(5)
        .x(d3.scaleOrdinal())
        .xUnits(dc.units.ordinal)
        // .xAxisLabel(dimensionColumn)
        .margins({left: 50, right: 30, top: 0, bottom: 40})
        // .yAxisLabel("Count")
        .elasticY(true)
        .dimension(dimension)
        .group(quantity)
    if (ordering != false) {
        if (ordering == 'key') {
            chart.ordering(d => mapping.getKey(d.key));
        } else {
            chart.ordering(d => -d.value);
        }
    }
    chart.render();
    if (rotate) {
        chart
        .selectAll('g > g.axis.x > g > text')
        .attr("y", 0)
        .attr("x", 0)
        .attr("transform", "rotate(-10)")
    }

    return chart;
}


d3.json(data_loc).then(crossfilter).then((cf_data)=>{
    dataCount(cf_data);
    charts['Preference'] = barChart(cf_data, 'Mode', "Preference", identicalMapping, 'preference', true, 'value', false, {colLength: 12, width: 1100, height: 250})
    charts['Gender'] = pieChart(cf_data, 'qgender', "Gender", genderMapping, 'row0', true, {colLength: 3});
    charts['License'] = pieChart(cf_data, 'qlicense', 'License', binaryMapping, 'row0', true, {colLength: 3, chartTitle: "Own Driver License? "})
    charts['Smartphone'] = pieChart(cf_data, 'qsmartphone', 'Smartphone', binaryMapping, 'row0', true, {colLength: 3, chartTitle: "Own Smartphone? "})
    charts['Rent'] = pieChart(cf_data, 'qrent', 'Rent', binaryMapping, 'row0', true, {colLength: 3, chartTitle: "Rent (Yes) or Own (No) home? "})
    charts['Age'] = barChart(cf_data, 'qage', 'Age', ageMapping, 'row0', true, false, true, {colLength: 6});
    charts['Race'] = barChart(cf_data, 'qrace', 'Race', raceMapping, 'row1', true, 'key', true, {colLength: 6, width: 550});
    charts['Education'] = barChart(cf_data, 'qeducation', 'Education', eduMapping, 'row1', true, 'key', true, {colLength: 6, width: 550});
    charts['Income'] = barChart(cf_data, 'qincome', 'Income', incMapping, 'row2', true, 'key', true, {colLength: 6, width: 550});
    charts['Borough'] = pieChart(cf_data, 'borough', 'Borough', identicalMapping, 'row2', true, {colLength: 3})
    charts['Employment'] = barChart(cf_data, 'qemployment', 'Employment', employmentMapping, 'row3', true, 'key', true, {colLength: 6, width: 550})
    charts['TimeInNYC'] = barChart(cf_data, 'qnyc', 'TimeInNYC', timeInNYCMapping, 'row3', true, 'key', true, {colLength: 6, width: 550, chartTitle: "How long have you been living in NYC? "})
    charts['Married'] = barChart(cf_data, 'qmarried', 'Married', marriedMapping, 'row4', true, 'key', true, {chartTitle: "Marital Status"})
});