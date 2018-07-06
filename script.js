/** SETUP
 * select the element in which to plot the data visualization
 * include a title and a description through header elements 
 * include the frame of an SVG canvas, in which to draw the data as it is queried
 * include a legend through rect elements 
 * define the scales for the horizontal and vertical axes
 * define the range for both axes. These rely on the width and height values of the SVG and can be set prior to retrieving the data
 */

// SELECT 
const container = d3.select(".container");

// TITLE 
container
    .append("h1")
    .attr("id", "title")
    .text("Monthly Global Land-Surface Temperature 🌍");

// DESCRIPTION
container
    .append("h3")
    .attr("id", "description")
    .text("1753 - 2015: base temperature 8.66℃");

// FRAME
// define a measure for the margin, included to frame the contents of the SVG inside of the SVG canvas itself by an arbitrary amount
// this to avoid any cropping, especially for the axes
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  // include a larger margin to the left as to show the values of minutes and seconds on the vertical axis
  left: 50
}

// define width and height measure deducting the arbitrary values by the respective margins
// this allows to later reference the width and height values and have them refer to the area inside of the SVG canvas, where the elements are not cropped out
const width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// include an SVG with a viewbox attribute dictating the width to height ratio
// the width property is included in the stylesheet and the height is included by proxy through the ratio defined by the viewbox
const containerCanvas = container
                          .append("svg")
                          // by adding the respective margins, the SVG canvas assumes the dimensions defined by the arbitrary values (800, 400)
                          // anything using the width and height values will be drawn inside of the canvas (but needs to be first positioned inside of the frame by a measure equal to the margins. This is achieved with a group element) 
                          .attr("viewBox", `0 0 ${width + margin.left + margin.right}  ${height + margin.top + margin.bottom}`);

// include a group element in which to position the SVG elements 
// by translating the group element by the measure defined by the margin, it is possible to have the SVG elements positioned inside the frame 
const canvasContents = containerCanvas
                          .append("g")
                          .attr("transform", `translate(${margin.left}, ${margin.top})`);

// LEGEND
// for the legend include rectangle elements with different fill color
// as the legend makes use of SVG syntax, the element is included _after_ the SVG has been included in the page, and the element is appended to the SVG itself

const legend = containerCanvas
                .append("g")
                .attr("id", "legend")
                .attr("transform", `translate(${width}, ${margin.top})`);

const legendValues = {
    fillColors: ["#e83a30", "#ee6d66", "#f4a09c", "#faddd1", "#a39cf4", "#7166ee", "#4030e8"],
    meaning: [11.2, 9.6, 8, 6.4, 4.8, 3.2, 1.6]
}
legend
    .selectAll("rect")
    .data(legendValues.fillColors)
    .enter()
    .append("rect")
    .attr("width", 40)
    .attr("height", 40)
    .attr("x", (d, i) => i*-40)
    .attr("y", 0)
    .attr("fill", (d, i) => legendValues.fillColors[i]);

legend 
    .selectAll("text")
    .data(legendValues.meaning)
    .enter()
    .append("text")
    .attr("x", (d, i) => i*-40)
    .attr("y", 55)
    .text((d, i) => legendValues.meaning[i]);


// SCALES
// for the horizontal scale include a time scale
// for the range (where the data will be displayed as output), include values from 0 up to the width
const xScale = d3
                .scaleTime()
                .range([0, width]);

// for the vartical scale include another time scale
// since the data points are set to be drawn with the smallest values on top, the range is not reversed
// the smallest values will be therefore at the top and the biggest values at the bottom (as the SVG coordinate system works top down) 
const yScale = d3
                .scaleTime()
                .range([0, height]);

// define parse functions to properly format the data passed through the array 
const parseTimeMonth = d3
                    // 1754-01
                    .timeParse("%Y-%m");

const parseTimeYear = d3
                    // 1754
                    .timeParse("%Y");


/** DATA
 * create an instance of an XMLHttpRequest object, to retrieve the data at the provided URL
 * upon receiving the data, set the domain of the scales and create the connected axes
 * plot the chart by including circle elements in the SVG
 * include a tooltip through a div (the tooltip should appear and disappear on the basis of the mouseenter and mouseout events, on the circle elements)
 */

// XMLHTTPREQUEST
const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const request = new XMLHttpRequest();
request.open("GET", URL, true);
request.send();
// on load call a function to draw the scatter plot 
// pass as argument the array containing the (35) objects
request.onload = function() {
    let json = JSON.parse(request.responseText);
    drawHeatMap(json);
}

function drawHeatMap(data) {
    /**
     * data is an object with two fields
     * data.baseTemperature; a single float value for the presumably global average
     * data.monthlyVariance; an array nesting multiple objects with the actual data
     * 
     * each data.monthlyVariance[i] has three keys
     *  data.monthlyVariance[i].year; a 4 digit value
     *  data.monthlyVariance[i].month; a digit for the month (1 to 12, without zero-padding the single-digit numbers)
     *  data.monthlyVariance[i].variance; a float describing the discrepancy between the measurement and the baseTemperature value
     *  
     */
    
    console.log(data);

}
