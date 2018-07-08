/** SETUP
 * select the element in which to plot the data visualization
 * include a title and a description through header elements 
 * include the frame of an SVG canvas, in which to draw the data as it is queried
 * include a legend through rect elements (the legend is here included following the SVG canvas as it is drawn with SVG elements, in the canvas itself)
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
  // include a larger margin to the left as to show the full name of the months on the vertical axis
  left: 60
}

// define width and height measure deducting the arbitrary values of the respective margins
// this allows to later reference the width and height values and have them refer to the area inside of the SVG canvas, where the elements are not cropped out
const width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// include an SVG with a viewbox attribute dictating the width to height ratio
// the width property is included in the stylesheet and the height is included by proxy through the ratio defined by the viewbox itself
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
// as the legend makes use of SVG syntax, the element is included _after_ the SVG has been included in the page
// the legend is appended to the SVG itself

// append the legend as a group element, positioned in the top right of the SVG canvas
const legend = containerCanvas
                .append("g")
                .attr("id", "legend")
                .attr("transform", `translate(${width}, ${margin.top})`);

// define in an object two arrays for the values of the legend and the size of the rectangle elemets
// an array describing the colors of each rect element
// an array escribing the values
const legendValues = {
    // the array are sorted from warmest color/highest value to coldest color/lowest value
    fillColors: ["#e83a30", "#ee6d66", "#f4a09c", "#faddd1", "#a39cf4", "#7166ee", "#4030e8"],
    meaning: [11.2, 9.6, 8, 6.4, 4.8, 3.2, 1.6],
    rectSize: 30
}

// in the group element which represents the legend apped one rectangle element for each fill color
legend
    .selectAll("rect")
    .data(legendValues.fillColors)
    .enter()
    .append("rect")
    // size the rectangle elements arbitrarily
    .attr("width", legendValues.rectSize)
    .attr("height", legendValues.rectSize)
    // position each rectangle elements to the left of the previous one
    // as the group element is positioned at the end of the SVG canvas, this allows to draw all rectangle inside of the canvas and ending at the precise spot described by the group element
    .attr("x", (d, i) => i*-legendValues.rectSize)
    // position the rectangle elements at the top of the svg canvas
    .attr("y", 0)
    // give each rectangle element a color as specified by the array of fillColors
    .attr("fill", (d, i) => legendValues.fillColors[i]);

// with text elements include text below each rectangle element of the legend
legend 
    .selectAll("text")
    .data(legendValues.meaning)
    .enter()
    .append("text")
    // arrange the text elements horizontally, just like the rectangle elements, and vertically, below the rectangle elements themselves
    .attr("x", (d, i) => i*-legendValues.rectSize)
    .attr("y", legendValues.rectSize + 15)
    .style("font-size", "0.7rem")
    // include the text specified by the array of values
    .text((d, i) => legendValues.meaning[i] + "°");


// SCALES
// for the horizontal scale include a time scale
// for its range (where the data will be displayed as output), include values from 0 up to the width
const xScale = d3
                .scaleTime()
                .range([0, width]);

// for the vartical scale include a band scale (used to display discrete values, evenly spaced in the axis)
// the discrete values are stored in an array describing the months of the year (from Jan to Dec)
// as the months are introduced in order, there's no need to reverse the range 

// include a margin equal to the size of the legend, as to avoid overlapping between the SVG heat map and the legend
let mapMarginTop = 55;
const yScale = d3
                .scaleBand()
                .range([mapMarginTop, height]);

// define a parse function to properly format the data passed in with the request 
const parseTimeYear = d3
                        .timeParse("%Y");


/** DATA
 * create an instance of an XMLHttpRequest object, to retrieve the data at the provided URL
 * upon receiving the data, set the domain of the scales and create the connected axes
 * plot the chart by including rectangle elements in the SVG
 * include a tooltip through a div (the tooltip should appear and disappear on the basis of the mouseenter and mouseout events, on the circle elements)
 */

// XMLHTTPREQUEST
const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const request = new XMLHttpRequest();
request.open("GET", URL, true);
request.send();
// on load call a function to draw the scatter plot 
// pass as argument the object containing the two values, one of which the data array with 3000+ measurements
request.onload = function() {
    let json = JSON.parse(request.responseText);
    drawHeatMap(json.monthlyVariance);
}

function drawHeatMap(data) {
    /**
     * json is an object with two fields
     * json.baseTemperature; a single float value for the presumably global average
     * json.monthlyVariance; an array nesting multiple objects with the actual data
     * 
     * the XMLHttpRequest passes as argument this last field, the array of objects
     * 
     *  data has therefore three keys
     *  data[i].year; a 4 digit value
     *  data[i].month; a digit for the month (1 to 12, without zero-padding the single-digit numbers)
     *  data[i].variance; a float describing the discrepancy between the measurement and the baseTemperature value
     */

    // FORMAT DATA
    // format the data to have date objects for the x scale's domain
    data.forEach((d)=> {
        d["year"] = parseTimeYear(d["year"]);
    });

    // DOMAIN
    // the scales' domains are defined by the minimum and maximum values of the month and year
    // for the xScale compute the min and max values separately, as to retrieve the min and max years, which are used in the attributes of the rectangle elements
    let maxScale = d3.max(data, d => d["year"]);
    let minScale = d3.min(data, d => d["year"]);

    // the width of the rectangle elements is computed based on the four digit year format
    let maxYear = maxScale.getFullYear();
    let minYear = minScale.getFullYear();

    xScale
        .domain([minScale, maxScale]);

    // for the y scale, include a domain equal to the discrete values of the months of the year
    // the scaleBands evenly distributes the space allowed by the range with the discrete options
    yScale 
        .domain(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);
    
    // AXES
    // initialize the axes based on the scales
    const xAxis = d3 
                    .axisBottom(xScale)
                    // alter the format of the tick labels to show the full four digits of the year
                    .tickFormat(d3.timeFormat("%Y"))
                    // show a tick every 10 years (instead of a default number of 10 ticks)
                    .ticks(d3.timeYear.every(10))
                    // remove the ticks at either end of the axis
                    .tickSizeOuter(0);

    const yAxis = d3 
                    .axisLeft(yScale)
                    .tickSizeOuter(0);


    // include the axes through group element
    canvasContents
        .append("g")
        .attr("id", "x-axis")
        // for the horizontal axis, position it at the bottom of the area defined by the SVG canvas
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    canvasContents
        .append("g")
        .attr("id", "y-axis")
        .call(yAxis);

    // TOOLTIP
    // incllude a tooltup with a div element
    const tooltip = container
                        .append("div")
                        .attr("id", "tooltip");

    // PLOT MAP
    // include rectangle elements 
    // their position is decided horizontally according to the date object
    // vertically according to their month only
    // their fill color is included according to the value found in the data.variance field (technically baseTemperature + data.variance)
    canvasContents
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("data-month", (d) => d["month"])
        .attr("data-year", (d) => d["year"])
        .attr("data-temp", (d) => d["variance"] + 8.66)
        // include two listeners for the mouseenter and mouseout events
        // as the cursor hovers on the element, transition the tooltip into view, with the text describing the rectangle element
        // as the cursor leaves, transition the tooltip out of sight
        // important: the event listener accepts as argument the data being processed (d), which is then used in the text of the tooltip
        .on("mouseenter", (d) => {
            tooltip 
                .attr("data-year", d["year"])
                // alter the opacity to make the tooltip visible
                .style("opacity", 1)
                // position the tooltip close to the cursor, using the d3.event object
                .style("left", `${d3.event.layerX}px`)
                // as the y scale is offset by the margin value, include the margin value to have the tooltip close to the actual hovered cell
                .style("top", `${d3.event.layerY + mapMarginTop}px`)
                .text(() => {
                    // d["year"], as it is processed through the parse function, represents an instance of the date object
                    // getFullYear() allows to retrieve the four-digit year 
                    let year = d["year"].getFullYear();
                    // d["variance"] allows instead to retrieve the difference in temperature from the base temperature
                    // limit the number of digits following the decimal point
                    let temperature = (d["variance"] + 8.66).toFixed(3);
                    // display in the tooltip the year, followed by temperature of the corresponding cell
                    return `${year} ${temperature}`;
            });
        })
        .on("mouseout", () => {
            tooltip
                .style("opacity", 0);
        })
        // the x coordinate of each element is determined by the individual instance of the date object, which is parsed according to the year
        .attr("x", (d) => xScale(d["year"]))
        // the y coordinate is determined the month of the measurement
        // as the height of each cell is determined by the height of the map divided by 12, multiply that by the number of the month
        // include the size of the rectangle as SVG elements are drawn top to bottom
        .attr("y", (d) =>  ((height - mapMarginTop)/12) * d["month"] + legendValues.rectSize)
        // a rectangle is included horizontally for each month, with as many elements as there are years matching that month
        // the width of the individual element is therefore equal to the width, divided by the number of years with the measured month
        .attr("width", (d) => width/(maxYear - minYear))
        // the height is determined by the height of the map divided by 12
        .attr("height", (d, i) => (height - mapMarginTop)/ 12)
        // the fill is altered according to the temperature of the year and month
        .attr("fill", (d, i) => {
            let baseTemperature = 8.66;
            let cellTemperature = d.variance + baseTemperature;

            if(cellTemperature > legendValues.meaning[0]) {
                return legendValues.fillColors[0];
            }
            else if(cellTemperature > legendValues.meaning[1]) {
                return legendValues.fillColors[1];
            }
            else if(cellTemperature > legendValues.meaning[2]) {
                return legendValues.fillColors[2];
            }
            else if(cellTemperature > legendValues.meaning[3]) {
                return legendValues.fillColors[3];
            }
            else if(cellTemperature > legendValues.meaning[4]) {
                return legendValues.fillColors[4];
            }
            else if(cellTemperature > legendValues.meaning[5]) {
                return legendValues.fillColors[5];
            }
            else {
                return legendValues.fillColors[6];
            }
        }) 
}
