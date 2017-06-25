//SET CONSTANTS
const height = 450;
const width = 1150;
const cellHeight = height/12;
const months = ["Jan", "Feb", "March", "April", "May", "June", "July", "August", "Sept", "Oct", "Nov", "Dec"];

const margin = {top: 10, right: 80, bottom: 90, left: 70};

var xScale = d3.scaleTime()
.range([0, width]);

//JAVSCRIPT FOR document.ready SECTION:
document.addEventListener("DOMContentLoaded", function() {

  var chart = d3.select("#chart")
                .attr("width", margin.right + width + margin.left)
                .attr("height", margin.top + height + margin.bottom);

  var req = new XMLHttpRequest();
  req.open("GET", "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json", true);

  //section executed once data recieved
  req.onload = function() {
    var json = JSON.parse(req.response);
    var baseTemp = json.baseTemperature;
    var data = json.monthlyVariance;

    //Set data dependent scales/constants
    const cellWidth = width/(d3.max(data, (d) => d.year) - d3.min(data, (d) => d.year));
    var coldest = baseTemp + d3.min(data, (d) => d.variance);
    var warmest = baseTemp + d3.max(data, (d) => d.variance);

    var colorScale = d3.scaleSequential()
                        .domain([coldest, warmest])
                        .interpolator(d3.interpolateInferno);

    xScale.domain([new Date(d3.min(data, (d) => d.year), 0, 0), new Date(d3.max(data, (d) => d.year), 0, 0)]);

    //JOINING data to rects here:
    var cell = chart.selectAll("rect").data(data).enter().append("rect")
      .attr("class", "cell")
      .attr("height", cellHeight)
      .attr("width", cellWidth)
      .attr("x", (d) => margin.left + xScale(new Date(d.year, 0, 0)))
      .attr("y", (d) => margin.top + (cellHeight * (d.month - 1)))
      .style("fill", function(d) {
      return colorScale(baseTemp + d.variance);
    });

    //Axis appendating...
    chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + height) + ")")
        .call(d3.axisBottom(xScale));

    for (let i = 0; i < 12; i++) {
      chart.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top + (i + 1) * (cellHeight) - cellHeight/2)
        .attr("text-anchor", "end")
        .attr("dx", -3)
        .text(months[i]);
    }

    //Append Key:
    var key = chart.append("g")
                  .attr("transform", "translate(" + (margin.left + (width/2) - 400) + "," + (margin.top + height + margin.bottom/2) + ")");

    var range = d3.extent(data, (d) => baseTemp + d.variance);
    var inc = (range[1] - range[0]) / 20;

    for (let i = 0; i < 20; i++) {
      let t = range[0] + (inc * i);
      console.log(t);
      key.append("rect")
        .attr("x", i * 40)
        .attr("y", 0)
        .attr("height", 20)
        .attr("width", 40)
        .style("fill", colorScale(t));

      key.append("text")
        .attr("x", i * 40 + 10)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .text(t.toFixed(1));
    }

    //HOVER FEATURE
    $(".cell").hover(function(e) {
      let info = document.getElementById("info");
      let date = months[this["__data__"].month - 1];
      let temp = baseTemp + this["__data__"].variance;
      temp = temp.toFixed(1);

      info.style.display = "block";
      info.innerHTML = "<strong>" + date + " " + this["__data__"].year + "</strong><br>" + temp + " °C";
      info.style.top = e.pageY + "px";
      info.style.left = (e.pageX + 15) + "px";

    },function() {
      let info = document.getElementById("info");
      info.style.display = "none";
    });
  }



  req.send(null);
});
