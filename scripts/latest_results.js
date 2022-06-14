function setup_LatestResult() {
    let mapSVG;
    let mapWidth, mapHeight;

    let pieSVG;
    let pieWidth, pieHeight;
    let pieRadius;

    let jsonData, csvData;

    let totalVotes = []
    let pieData = {}
    let sortedMapData = []
    let selectedState = 0
    const pieColors = ["red", "blue", "silver"]
    const colorsByParty = {
        "reps": "red",
        "demo": "blue",
        "other": "silver"
    }

    function convert(t, a, b, c, d) {
        return c + (d - c) / (b - a) * (t - a)
    }

    // State indexes don't match in the geoJSON file, so they have to be converted first before being used.
    function getStateIndex(stateName) {
        if (stateName === "Washington DC") {
            stateName = "District of Columbia"
        }

        for (let i = 0; i < csvData.length; i++) {
            if (csvData[i].countryName === stateName) return [i, stateName];
        }

        return [0, stateName]
    }

    function updatePiechart(index) {
        let data = pieData[index]

        let pie = d3.pie()
            .value(function (d) { return d.value; })
        let data_ready = pie(d3.entries(data))

        let arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(pieRadius)
            
        pieSVG.selectAll(".mySlices").remove()
        pieSVG
            .selectAll(".mySlices")
            .data(data_ready)
            .enter()
            .append('path')
            .attr("class", "mySlices")
            .attr('d', arcGenerator)
            .attr('fill', function (d, i) { return colorsByParty[d.data.key] })
            .attr("transform", "translate(" + pieRadius + ", " + pieRadius + ")")
    }

    // Clicking on a state alters the barchart without animations.
    function onStateClicked(d, i) {
        let clickToShowDiv = document.getElementById("click_to_show");
        if (clickToShowDiv) {
            clickToShowDiv.parentNode.removeChild(clickToShowDiv)
        }

        let indexAndName = getStateIndex(d.n)

        let stateNameH3 = document.getElementById("latest_results_data_country");
        stateNameH3.textContent = indexAndName[1]
        stateNameH3.style.opacity = 1

        const piechart = document.getElementById("latest_result_data_piechart");
        piechart.style.opacity = 1;
        updatePiechart(indexAndName[0])

        const titles = document.getElementById("latest_results_table")
        titles.style.opacity = 1;

        let currentData = pieData[indexAndName[0]]
        let reps = parseInt(csvData[indexAndName[0]]["repVotes"])
        let demos = parseInt(csvData[indexAndName[0]]["demoVotes"])
        let total = parseInt(csvData[indexAndName[0]]["totalVotes"])
        let others = total - demos - reps

        reps = (reps / total * 100).toFixed(2)
        demos = (demos / total * 100).toFixed(2)
        others = (100 - reps - demos).toFixed(2)

        titles.innerHTML = "<h4>Republicans: " + reps + " %</h4>" + "<h4>Democrats: " + demos + " %</h4>" + "<h4>Others: " + others + " %</h4>";
    }

    // The Map is set up in the same way the USA state overview does it.
    function setupMap(data, csv) {
        mapSVG = d3.select("#map_usa")
        mapWidth = mapSVG.style("width")
        mapHeight = mapSVG.style("height")

        d3.select("#latest_results_map")
            .selectAll(".latest_results_map_state")
            .data(data)
            .enter()
            .append("path")
            .attr("class", "latest_results_map_state")
            .attr("d", function (d) {
                return d.d;
            })
            .style("fill", function (d, i) {
                let [index, name] = getStateIndex(d.n)
                
                const reps = parseInt(csvData[index].repVotes)
                const demos = parseInt(csvData[index].demoVotes)
                const total = parseInt(csvData[index].totalVotes)

                let repsPercentage = reps / total
                let demosPercentage = demos / total

                repsPercentage = convert(repsPercentage, 0, 1, 0.5, 1)
                demosPercentage = convert(demosPercentage, 0, 1, 0.5, 1)

                if (repsPercentage < demosPercentage) {
                    return "rgb(0, 0, " + 255 * repsPercentage + ")"
                } else {
                    return "rgb(" + 255 * demosPercentage + ", 0, 0)"
                }
            })
            .attr("transform", "scale(0.65) translate(40, 30)")
            .on("click", onStateClicked)
    }

    // Huge helper: https://d3-graph-gallery.com/pie.html
    function setupPiechart(data) {
        Object.keys(data).forEach(key => {
            let rep = parseInt(data[key]["repVotes"])
            let demo = parseInt(data[key]["demoVotes"])
            let other = parseInt(data[key]["totalVotes"]) - rep - demo

            pieData[key] = {
                reps: rep,
                demo: demo,
                other: other
            }

            totalVotes.push(parseInt(data[key]["totalVotes"]))
        })

        pieSVG = d3.select("#latest_result_data_piechart")
        pieWidth = parseInt(pieSVG.style("width"))
        pieHeight = parseInt(pieSVG.style("height"))
        pieRadius = Math.min(pieWidth / 2, pieHeight / 2)

        var data = { reps: 1, demo: 1, other: 1 }

        var pie = d3.pie()
            .value(function (d) { return d.value; })
        var data_ready = pie(d3.entries(data))

        var arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(pieRadius)
            
        pieSVG
            .selectAll('mySlices')
            .data(data_ready)
            .enter()
            .append('path')
            .attr("class", "mySlices")
            .attr('d', arcGenerator)
            .attr('fill', function (d, i) { return pieColors[i] })
            .attr("transform", "translate(" + pieRadius + ", " + pieRadius + ")")

    }

    d3.json("/data/map_usa_geo.json", function (json) {
        d3.csv("/data/votes2020.csv", function (csv) {
            jsonData = json
            csvData = csv
            setupMap(json, csv)
            setupPiechart(csv)
        })
    })
}

setup_LatestResult()