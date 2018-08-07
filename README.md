Link to the work-in-progress pen right [here](https://codepen.io/borntofrappe/pen/qKeGLM).

## Preface

For the third project in the line of "Data Visualization Projects", the task is to visualize some arbitrary data through a _heat map_. Arbitrary data which contemplates the global land-surface temperature, as shown in the [example pen](https://codepen.io/freeCodeCamp/full/JEXgeY).

The graph does seem to deviate from the previous challenges, which instead where quite similar to one another. That however doesn't remotely imply that the knowledge so far obtained in the library can't be applied to the new task. By far.

The way the data, axes and SVG are managed is much similar in all the different projects. Such is the beauty of the D3.js library.

## Data

Before jumping in the user stories, I'd like to spend a few moments on the data which is to be visualized.

The data itself is available at the following [URL](https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json):

```text
https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json
```

The URL presents a JSON object, with two fields, for the `baseTemperature` and `monthlyVariance`.

The first key holds an overarching value which represent the average tempeature throughout the analyzed time-frame. It is a high level measure which summarises the entire visualization.

The second key instead holds an array of several objects. One object for each month and therefore twelve objects for each year, for the period beginning in 1753 and ending in 2015.

This is where the data for the actual graph lies, so the field warrants a tad more analysis.

Each object in the array has three properties:

- `year`, in the form of a four digit integer;

- `month`, in the form of an integer, representing the month starting with 1 for January and incrementing the value up to 12 for Devember;

- `variance`, in the form of a float describing the difference in temperature with respect to the `baseTemperature` value. This is a number with up to three digits after the decimal point. Merged with the `baseTemperature` value, it allows to retrieve the base temperature for the respective year and month.

The data set is hence summed up. It is by far not a complex set of data, just a trifle long.

Regardless, the look-around was worth the extra time. Analyzing the data helps already to create a plan regarding which values to include and how to practically get a hold of them.

## User Stories

For the project to fulfill all requirements set by the testing suite @freeCodeCamp, the project needs to clear a series of user stories, here summarised.

- [x] there exist a title with `id="title"`;

- [x] there exist a description with `id="description"`;

- [x] there exist axes with `id="x-axis"` and `id="y-axis"` respectively;

- [x] there exist `rect` elements with `class="cell"` for the different data points;

- [x] there exist at least 4 different fill colors;

- [x] each cell should carry three properties: `data-month`, `data-year`, `data-temp`, respectively holding information regarding the month, year and tempeature;

- [x] the dates in the attribute need to be within the range of the data;

- [ ] each cell should be aligned to the corresponding month in the y-axis and the corresponding year in the x-axis;

- [x] tick labels on the y-axis need to display the name of the month, in full;

- [x] tick labels on the x-axis need to display the year, from 1754 and 2015;

- [x] there exist a legend with `id="legend"`;

- [x] the legend ought to contain `rect` elements. These should use at least 4 different fill colors;

- [x] upon hovering on the `rect` elements of the visualization, it is possible to see a tooltip with `id="tooltip"`, displaying additional data;

- [x] the tooltip should have a `data-year` attribute matching the attribute with the same name for the hovered area.

## First Thoughts

For the design of the page, the same style used for the [previous](https://codepen.io/borntofrappe/pen/mKGZaO) [proejcts](https://codepen.io/borntofrappe/pen/ERzybV) is included for the heat map as well. This helps cut down the time spent on colors and fonts, and it allows me to also maintain a consistent style throughout the different data viz challenges. It may come to no surprise, but the common style of all projects is self-serving, as all data viz may be later included in a single page, which allows to toggle between different visualization. The card format borrows itself perfectly to this kind of project.

A tad more time is spent on picking additional colors, specifically for the fill color of each rectangle element. As visible in the referenced pen, the colors need to represent the temperature and its varying intensity. The intensity is visually described by cold and hot colors, going from blue hues to red picks. 

The threshold at which the fill colors are specified represents an interesting measure. Indeed, the visualization can include the amounts specified in the example pen (2.8, 3.9 and so forth), but additional care can be included in selecting the most appropriate digits.

From the actual perspective of completing the project though, a rough measure is computed from the average value of the measured temperature. Starting from 1.6 degrees the amount is doubled, tripled to consider the possible temperatures with selected hues. This quick solution allows to dedicate more time on the actual technical challenges behind the project.

As I mentioned ealier, the project does look different from the previous data visualization. The rectangle elements included side by side seem to provide the most challenging aspect of the visualization, while the difference in color seems to be rather easy to implement.

## Update

**scaleBand**

After quite some time spent tweaking two time-scales, I realized that the vertical axis is primed for another type of scale which is supported by d3.js, namely a `scaleBand`. This is used to display discrete values, dividing the allocated space in even intervals, and it is therefore the ideal solution to display twelve months across the y-axis.

The range of a `scaleBand` is not different from the range used for a `scaleTime`, nor the range of a `scaleLinear` for that matter. The only precaution taken in the project is the inclusion of some margin, used to avoid any overlap between the heat map and the legend positioned atop the SVG canvas. Instead of setting a range from 0 to the height of the canvas, the range of the specific project goes therefore from the arbitrary margin to the height of the canvas. The arbitrary margin is calculated as the height of the rectangles used in the legend, plus the height of the text beneath each rectangle, plus some comfortable spacing. 

```JS
let mapMarginTop = 55;
const yScale = d3
                .scaleBand()
                .range([mapMarginTop, height]);
```

Unlike the range, the domain of a `scaleBand` does differ from previous scales. Indeed, as the scale is set to display discrete values, the twelve months are included in an array, which is then passed as the argument of the `domain()` function.

```JS
yScale 
        .domain(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);

```

**data**

The function which is called in response to the XMLHttp request does not pass as argument the entire JSON object. Instead, it passes the field containing the array of data. This is done to more easily access the multiple data points and rapidly access their diferrent values, in terms of month, year of measurement and measurement of the variance.

```JS
// XMLHTTPREQUEST
const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const request = new XMLHttpRequest();
request.open("GET", URL, true);
request.send();
request.onload = function() {
    let json = JSON.parse(request.responseText);
    drawHeatMap(json.monthlyVariance);
}
```

By including the array, the `drawHeatMap()` function has easy reach into the data required to draw the different rectangle elements. Such as with the following snippet, which parses the year of the measurement to a date object.

```JS
function drawHeatMap(data) {
  data.forEach((d)=> {
        d["year"] = parseTimeYear(d["year"]);
  });
}
```

_Caveat_

This solution has the unfortunate side effect of not including  the other field of the JSON object, and the `drawHeatMap()` function would need to include such a value directly. To circumvent such an issue, the `drawHeatMap()` function can be made to accept two arguments, including in the first field exactly this measure.

```JS
// XMLHTTP REQUEST
// on load function 
request.onload = function() {
    let json = JSON.parse(request.responseText);
    drawHeatMap(json.baseTemperature , json.monthlyVariance);
```

```JS
function drawHeatMap(base, data) {
  data.forEach((d)=> {
        d["year"] = parseTimeYear(d["year"]);
  });
}
```
**rect**

Rectangle elements with `class="cell"` are used to display the data found in the array.

Following the inclusion of the class and attributes specified by several user stories, the focus is on the coordinates of each rectangle element.

- for the horizontal coordinate, this is set according to the year of each measure, passed in the defined scale. The scale takes the date object and outputs it accordingly along the horizontal axis;

- for the vertical coordinate, the rectangle elements ought to be displayed according to their month values. Taking into account the individual height of the rectangles (as the height of the allocated area divided by twelve), it is a plain matter of placing each row at a distance from the top defined by this measure and multiplied by the number of the month;

- as mentioned for the vertical coordinate, the height is computed as the height of the allocated area divided by 12. The allocated area needs to account for the height of the SVG canvas, but also the margin included at the top;

- the width of the rectangle elements is a fraction of the total width of the SVG canvas. As each row shows the different measurements for each month, the fraction is determined by the number of years for which the observation is present. It is the answer to the contrived question: how many January are measured.


## Issues

This section plans to list the tests not passing the suite set up @freeCodeCamp, as to then solve each one of them and clear pending issues to finally close the project.

**Failed Test #8**

> My heat map should have cells that align with the corresponding month on the y-axis.

With the following error message:

> AssertionError: month values don't line up with y location: expected false to be true