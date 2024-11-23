function scatter_plot(data,
    ax,
    title = "",
    xCol = "",
    yCol = "",
    rCol = "",
    legend = [],
    colorCol = "",
    margin = 50) {

const X = data.map(d => d[xCol]);
const Y = data.map(d => d[yCol]);
const R = data.map(d => d[rCol]);
const colorCategories = [...new Set(data.map(d => d[colorCol]))];
const color = d3.scaleOrdinal()
.domain(colorCategories)
.range(d3.schemeTableau10);

const xExtent = d3.extent(X, d => +d);
const yExtent = d3.extent(Y, d => +d);

const xMargin = (xExtent[1] - xExtent[0]) * 0.05;
const yMargin = (yExtent[1] - yExtent[0]) * 0.05;

const xScale = d3.scaleLinear()
.domain([xExtent[0] - xMargin, xExtent[1] + xMargin])
.range([margin, 1000 - margin]);

const yScale = d3.scaleLinear()
.domain([yExtent[0] - yMargin, yExtent[1] + yMargin])
.range([1000 - margin, margin]);

const rScale = d3.scaleSqrt().domain(d3.extent(R, d => +d)).range([4, 12]);
const Fig = d3.select(`${ax}`);

Fig.selectAll('.markers')
.data(data)
.join('g')
.attr('transform', d => `translate(${xScale(d[xCol])}, ${yScale(d[yCol])})`)
.append('circle')
.attr("class", (d, i) => `cls_${i} ${d[colorCol]}`)
.attr("id", (d, i) => `id_${i} ${d[colorCol]}`)
.attr("r", d => rScale(d[rCol]))
.attr("fill", d => color(d[colorCol]));

// x and y Axis
const x_axis = d3.axisBottom(xScale).ticks(6);
const y_axis = d3.axisLeft(yScale).ticks(6);

Fig.append("g").attr("class", "axis")
.attr("transform", `translate(0,${1000 - margin})`)
.call(x_axis);

Fig.append("g").attr("class", "axis")
.attr("transform", `translate(${margin}, 0)`)
.call(y_axis);

// X-Axis Label
Fig.append("text")
.attr("class", "axis-label")
.attr("x", 500) // Center the label
.attr("y", 1000 - 10) // Position just below the x-axis
.attr("text-anchor", "middle")
.style("font-size", "14px")
.style("fill", "black")
.text(xCol);

// Y-Axis Label
Fig.append("text")
.attr("class", "axis-label")
.attr("transform", "rotate(-90)")
.attr("x", -500) // Position along the y-axis
.attr("y", 15) // Offset slightly to the left
.attr("text-anchor", "middle")
.style("font-size", "14px")
.style("fill", "black")
.text(yCol);

// Title for scatter plot
Fig.append('text')
.attr('class', 'plot-title')
.attr('x', 500)
.attr('y', 30)
.attr("text-anchor", "middle")
.style("font-size", "16px")
.style("fill", "black")
.text(title);

// Brush
const brush = d3.brush()
.extent([[margin, margin], [1000 - margin, 1000 - margin]])
.on("start", brushStart)
.on("brush end", brushed);

Fig.call(brush);

function brushStart() {
d3.selectAll("circle").classed("selected", false);
}

function brushed({ selection }) {
if (!selection) return;
const [[x0, y0], [x1, y1]] = selection;
d3.selectAll("circle").classed("selected", d =>
+d[xCol] >= xScale.invert(x0) &&
+d[xCol] <= xScale.invert(x1) &&
+d[yCol] >= yScale.invert(y1) &&
+d[yCol] <= yScale.invert(y0)
);
}

// Legend
const legendContainer = Fig
.append("g")
.attr("transform", `translate(800, ${margin})`);

if (legend.length === 0) legend = colorCategories;

const legends_items = legendContainer.selectAll("legends")
.data(legend)
.join("g")
.attr("transform", (d, i) => `translate(0,${i * 45})`);

// Color blocks in the legend
legends_items.append("rect")
.attr("fill", d => color(d))
.attr("width", "40")
.attr("height", "40");

// Country names beside the legend color blocks
legends_items.append("text")
.text(d => d)
.attr("dx", 50) // Adjust to position text beside the blocks
.attr("dy", 25)
.style("font-size", "14px")
.style("fill", "black");

// Add interactivity to legend items
legends_items.on("click", (event, d) => {
// Toggle visibility of points belonging to the selected country
const isActive = d3.selectAll(`.${d}`).style("opacity") === "1";
d3.selectAll(`.${d}`)
.style("opacity", isActive ? "0.2" : "1"); // Dim or restore visibility
});
}
