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

let improveAnsMapping = new CatagoricalMapping({
    1 : "Extremely important", 
    2 : "Very important", 
    3 : "Somewhat important", 
    4 : "Not very important", 
    5 : "Not at all important", 
    6 : "Don't know", 
    7 : "Refused",
    99: "Other" // DEBUG: I don't know what this is
})

let improveQuestionMapping = new CatagoricalMapping({
    "gIMPROVE1_qIMPROVE1_mA": "Making it safer for pedestrians to cross the street", 
    "gIMPROVE1_qIMPROVE2_mA": "Making it safer and easier to bike by adding bike lanes", 
    "gIMPROVE1_qIMPROVE3_mA": "Making bus service faster and more reliable by adding bus lanes", 
    "gIMPROVE1_qIMPROVE4_mA": "Making it easier to drive by reducing congestion", 
    "gIMPROVE1_qIMPROVE5_mA": "Making streets and public spaces greener and more attractive"
})

let freightAnsMapping = new CatagoricalMapping({
    1 : "Daily",
    2 : "Most days",
    3 : "A few times a week",
    4 : "A few times a month",
    5 : "A few times a year",
    6 : "Never",
    7 : "Don't know", 
    8 : "Refused",
    99: "Other" // DEBUG: I don't know what this is
})

let freightQuestionMapping = new CatagoricalMapping({
    "gFREIGHT1_qFREIGHT1_mA": "Groceries/liquor/household staples", 
    "gFREIGHT1_qFREIGHT2_mA": "Prepared food (take out)", 
    "gFREIGHT1_qFREIGHT3_mA": "Personal items",
    "gFREIGHT1_qFREIGHT4_mA": "Other packages (clothing, Amazon etc.)"
})

let safeMapping = new CatagoricalMapping({
    1 : "Very safe",
    2 : "Somewhat safe",
    3 : "Somewhat unsafe",
    4 : "Not safe at all",
    5 : "Other", // Don't know
    6 : "Other"  // "Refused"
})

function groupData(cf_data, dimensionColumns, mappings) {
    if (typeof(dimensionColumns) === 'string') {
        return unigroupData(cf_data, dimensionColumns, mappings)
    }
    return multigroupData(cf_data, dimensionColumns, mappings)
}

function unigroupData(cf_data, dimensionColumn, mapping) {
    let dimension = cf_data.dimension(item => mapping.get(item[dimensionColumn]));
    let quantity = dimension.group().reduceSum(item => item.avgwt);
    let result = quantity.all();

    if (debug_mode) {
        console.log(dimensionColumn);
        console.log(result);
    }
    return [dimension, quantity]
}

function multigroupData(cf_data, dimensionColumns, mappings) {
    let dimension = cf_data.dimension(item => {
        var result = []
        for (let index = 0; index < dimensionColumns.length; index++) {
            result.push(mappings[index].get(item[dimensionColumns[index]]))
        }
        return result;
    });
    let quantity = dimension.group().reduceSum(item => item.avgwt);
    let result = quantity.all();

    if (debug_mode) {
        console.log(dimensionColumns);
        console.log(result);
    }
    return [dimension, quantity]
}

// function dataCount(cf_data){
//     dc.dataCount('#reset-all')
//       .crossfilter(cf_data)
//       .groupAll(cf_data.groupAll())
//       .html({
//         some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
//             ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
//         all: 'All records selected. Please click on the graph to apply filters.'
//     });
// }

function dataCount(cf_data){
    let uidDimension = cf_data.dimension(item => item.UniqueID)
    let total = cf_data.groupAll().reduceSum(item=>item.avgwt).value()
    let cntID = uidDimension.groupAll().reduceSum(item => item.avgwt)
    dc.numberDisplay('#reset-all')
      .group(cntID)
      .valueAccessor(item => item)
      .formatNumber(d3.format('.0f'))
      .html({
        some: `<strong>%number</strong> selected out of <strong>${total.toFixed(0)}</strong> records` +
            ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>'
    });
}

function createGraphDiv(chartID, divID, chartTitle=undefined, colLength=undefined, resetButton=true, metaDivID='filters'){
    if (d3.select(`#${divID}`).empty()) {
        d3.select(`#${metaDivID}`)
          .append('div')
          .attr('id', divID)
          .attr('class', 'row mb-4')
    }
    let div = d3.select(`#${divID}`)
                .append('div')
                .attr("id", chartID)
                .attr('class', `dc-chart col-${colLength || 4}`); 
    div.append("strong")
        .text(chartTitle || chartID);
    d3.select(`#${chartID}`)
    .append('a')
    .attr('class', 'reset float-right')
    .style('display', 'none')
    .text('reset');
    div.append('div')
        .attr('class', 'clearfix');
    if(resetButton){
        bindResetButton(chartID);
    }
}

function bindResetButton(chartID){
    d3.select(`#${chartID}`)
    .select('a')
    .attr('href', `javascript:charts['${chartID}'].filterAll();dc.redrawAll();`);
}

function stickyTop(mode){
    let class_attr, a_href, a_text = undefined
    if (mode == 'stick') {
        class_attr = 'sticky-top bg-light mt-4 mb-4'
        a_href = 'javascript:stickyTop("unstick")'
        a_text = 'Unfix preference bar chart'
    } else if (mode == 'unstick') {
        class_attr = 'mt-4 mb-4'
        a_href = 'javascript:stickyTop("stick")'
        a_text = 'Fix preference bar chart at top'
    }
    d3.select(`#header`)
    .attr('class', class_attr)
    d3.select(`#stickButton`)
    .attr('href', a_href)
    .text(a_text)
}

function onload(){
    setTimeout(showPage, 4000);
}

function showPage(){
    document.getElementById("loader").style.display = "none";
    document.getElementById("main").style.display = "block";
}

function pieChart(cf_data, dimensionColumn, pieChartID, mapping=identicalMapping, divID='filters', resetButton=true, pieChartParameters={}){
    createGraphDiv(pieChartID, divID, pieChartParameters['chartTitle'], pieChartParameters['colLength'], resetButton)
    let [dimension, quantity] = groupData(cf_data, dimensionColumn, mapping)

    var pie = dc.pieChart(`#${pieChartID}`);
    pie
        .width(180)
        .height(180)
        .innerRadius(pieChartParameters['innerRadius'] || 0)
        .label(pieChartParameters['label'] || function(d) {
                    return d.key + ': ' + parseInt(d.value); 
            })
        .dimension(dimension)
        .group(quantity)
        .ordinalColors(d3.schemeTableau10)
    pie.render();
    return pie;
}

function barChart(cf_data, dimensionColumn, barChartID, mapping=identicalMapping, divID='filters', resetButton=true, ordering=false, rotate=false, barChartParameters={}){
    createGraphDiv(barChartID, divID, barChartParameters['chartTitle'], barChartParameters['colLength'], resetButton);
    let [dimension, quantity] = groupData(cf_data, dimensionColumn, mapping)
    var chart = dc.barChart(`#${barChartID}`);
    chart
        .width(barChartParameters['width']||500)
        .height(barChartParameters['height']||200)
        .barPadding(0.1)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .margins({left: 50, right: 30, top: 0, bottom: 40})
        .elasticY(true)
        .dimension(dimension)
        .group(quantity)
        .ordinalColors(d3.schemeTableau10)
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

function heatMap(cf_data, keyAccessorColumn, valueAccessorColumn, keyAccessorMapping, valueAccessorMapping, heatMapChartID, divID, resetButton=true, heatMapParameters={}) {
    createGraphDiv(heatMapChartID, divID, heatMapParameters['chartTitle'], heatMapParameters['colLength'], resetButton);
    let [dimensions, quantity] = groupData(cf_data, [keyAccessorColumn, valueAccessorColumn], [identicalMapping, identicalMapping])

    var chart = dc.heatMap(`#${heatMapChartID}`);
    chart
    .width(heatMapParameters['width']||1100)
    .height(heatMapParameters['height']||200)
    .dimension(dimensions)
    .group(quantity)
    .keyAccessor(function(d) { return d.key[0]; })
    .valueAccessor(function(d) { return d.key[1]; })
    .colorAccessor(function(d) { return +d.value; })
    .colsLabel(d => keyAccessorMapping.get(d))
    .rowsLabel(d => valueAccessorMapping.get(d))
    .title(function(d) {
        return `${keyAccessorColumn}:   ` + d.key[0] + "\n" +
               `${valueAccessorColumn}:   ` + d.key[1] + "\n" +
               "Count: " + d.value;})
    .margins({left: heatMapParameters['marginsLeft']||200, right: 30, top: 0, bottom: 40})
    .xBorderRadius(0)
    .colors(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
    .calculateColorDomain();
    
    chart.render();
    return chart

}

d3.json(data_loc).then(crossfilter).then((cf_data)=>{
    dataCount(cf_data);
    charts['Preference'] = barChart(cf_data, 'Mode', "Preference", identicalMapping, 'preference', true, 'value', false, {colLength: 12, width: 1100, height: 250})

    charts['Gender'] = pieChart(cf_data, 'qgender', "Gender", genderMapping, 'row0', true, {colLength: 2});
    charts['Age'] = barChart(cf_data, 'qage', 'Age', ageMapping, 'row0', true, false, true, {colLength: 5});
    charts['Race'] = barChart(cf_data, 'qrace', 'Race', raceMapping, 'row0', true, 'key', true, {colLength: 5, width: 450});
    
    charts['Education'] = barChart(cf_data, 'qeducation', 'Education', eduMapping, 'row1', true, 'key', true, {colLength: 6, width: 550});
    charts['Married'] = barChart(cf_data, 'qmarried', 'Married', marriedMapping, 'row1', true, 'key', true, {chartTitle: "Marital Status"})

    charts['Employment'] = barChart(cf_data, 'qemployment', 'Employment', employmentMapping, 'row2', true, 'key', true, {colLength: 6, width: 550})
    charts['Income'] = barChart(cf_data, 'qincome', 'Income', incMapping, 'row2', true, 'key', true, {colLength: 6, width: 550});

    charts['Borough'] = pieChart(cf_data, 'borough', 'Borough', identicalMapping, 'row3', true, {colLength: 3, label: d=>d.key})
    charts['TimeInNYC'] = barChart(cf_data, 'qnyc', 'TimeInNYC', timeInNYCMapping, 'row3', true, 'key', true, {colLength: 9, width: 800, chartTitle: "How long have you been living in NYC? "})

    charts['License'] = pieChart(cf_data, 'qlicense', 'License', binaryMapping, 'row4', true, {colLength: 4, chartTitle: "Own Driver License? "})
    charts['Smartphone'] = pieChart(cf_data, 'qsmartphone', 'Smartphone', binaryMapping, 'row4', true, {colLength: 4, chartTitle: "Own Smartphone? "})
    charts['Rent'] = pieChart(cf_data, 'qrent', 'Rent', binaryMapping, 'row4', true, {colLength: 4, chartTitle: "Rent (Yes) or Own (No) home? "})

    
    charts['Safe1'] = barChart(cf_data, 'qsafety1', 'Safe1', safeMapping, 'row5', true, 'key', true, {colLength: 6, chartTitle: 'How safe do you feel while walking in your neighborhood?'})
    charts['Safe2'] = barChart(cf_data, 'qsafety2', 'Safe2', safeMapping, 'row5', true, 'key', true, {colLength: 6, chartTitle: 'How safe do you feel while walking in New York City in general?'})


    charts['Freight'] = heatMap(cf_data, 'FreightAnswer', 'qFreight', freightAnsMapping, freightQuestionMapping, 'Freight', 'row7', true, {colLength: 12, chartTitle: "How often do you receive deliveries at home for the following?"})
    charts['Improve'] = heatMap(cf_data, 'ImproveAnswer', 'qImprove', improveAnsMapping, improveQuestionMapping, 'Improve', 'row7', true, {colLength: 12, chartTitle: "How important are the following to you? ", marginsLeft: 300})
});