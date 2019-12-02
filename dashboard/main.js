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

let identicalMapping = item => item;

function pieChart(cf_data, dimensionColumn, pieChartID, mapping=identicalMapping){
    let dimension = cf_data.dimension(item => mapping(item[dimensionColumn]));
    let quantity = dimension.group().reduceCount(item => item);
    let result = quantity.all();

    if (debug_mode) {
        console.log(dimensionColumn);
        console.log(result);
    }

    var pie = dc.pieChart(pieChartID);
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

d3.json(data_loc).then(crossfilter).then((cf_data)=>{
    pieChart(cf_data, 'qgender', "#pie1", genderMapping);
    pieChart(cf_data, 'qage', '#pie2', )
});