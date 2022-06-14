function setup_VotesPerStateBlockchart() {
    const FIRST_YEAR = 1972, LAST_YEAR = 2020
    const NUMBER_OF_ELECTIONS = (LAST_YEAR - FIRST_YEAR) / 4 + 1

    const ID_VOTES_PER_STATE_BARCHART = "#votes_per_state_barchart"
    const ID_VOTES_PER_STAET_TOOLTIP = "#votes_per_state_tooltip"
    const margins = { top: 10, bottom: 60, right: 30, left: 60 }

    let width = 0, height = 0

    let election_results = {}
    let elections_years = []
    let filesLoadedCount = 0

    // 10 Most Popular states
    // Alabama, Nevada, New York, California, Texas
    // Arizona, Mississippi, Hawaii, Pennsylvania, Tennessee
    const popularCountryIndexes = [0, 2, 28, 32, 4, 43, 24, 11, 38, 42]
    let maxPopularity

    let currentYear = LAST_YEAR
    let svg;
    let xRange, yRange;

    function createTooltip(party, votes) {
        return "<h4>" + party + ": " + votes + "</h4>"
    }

    function showBarchartTooltip(data, index, party) {
        d3.select(ID_VOTES_PER_STAET_TOOLTIP)
            .transition()
            .duration(200)
            .style("opacity", .9);

        let votes = ""
        if (party === "Democrats") {
            votes = Object.values(election_results[currentYear])[popularCountryIndexes[index]].demo
        } else {
            votes = Object.values(election_results[currentYear])[popularCountryIndexes[index]].rep
        }

        d3.select(ID_VOTES_PER_STAET_TOOLTIP)
            .html(createTooltip(party, votes))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

    }

    function hideBarchartTooltip() {
        d3.select(ID_VOTES_PER_STAET_TOOLTIP)
            .transition()
            .duration(500)
            .style("opacity", 0);
    }

    function setupVotesPerStateBarchart() {

        maxPopularity = Math.max(
            Math.max(...Object.values(election_results).map(yearResult => {
                return Math.max(...Object.values(yearResult).map(stateResult => parseInt(stateResult.demo)))
            })),
            Math.max(...Object.values(election_results).map(yearResult => {
                return Math.max(...Object.values(yearResult).map(stateResult => parseInt(stateResult.rep)))
            }))
        )

        svg = d3.select(ID_VOTES_PER_STATE_BARCHART)
        width = parseInt(svg.style("width").replace("px")) - (margins.left + margins.right)
        height = parseInt(svg.style("height").replace("px")) - (margins.top + margins.bottom)

        svg.selectAll("*").remove()

        const xAxisLabels = popularCountryIndexes.map(index => {
            return Object.keys(election_results[FIRST_YEAR])[index]
        })

        xRange = d3.scaleBand()
            .range([0, width])
            .domain(xAxisLabels)
            .padding(0.5);
        svg.append("g")
            .attr("transform", "translate(" + margins.left + "," + (height + margins.top) + ")")
            .call(d3.axisBottom(xRange))
            .selectAll("text")
            .attr("font-size", "1.2em")
            .style("text-anchor", "center");

        yRange = d3.scaleLinear()
            .range([height, 0])
            .domain([0, maxPopularity])
        svg.append("g")
            .attr("transform", "translate(" + margins.left + ", " + margins.top + ")")
            .call(d3.axisLeft(yRange)
                .tickFormat(d => (d / 10000) + " K"))
            .attr("font-size", "1em")

        const currentYearDemoData = Object.keys(election_results[currentYear]).map(key => [key, election_results[currentYear][key].demo])
        const currentYearRepData = Object.keys(election_results[currentYear]).map(key => [key, election_results[currentYear][key].rep])

        let demoData = popularCountryIndexes.map(index => currentYearDemoData[index])
        let repData = popularCountryIndexes.map(index => currentYearRepData[index])

        svg.selectAll(".bar_demo")
            .data(demoData)
            .enter()
            .append("rect")
            .attr("class", "bar_demo")
            .attr("x", d => xRange(d[0]))
            .attr("y", function (d, i) {
                return margins.top + height * (1 - parseInt(d[1]) / maxPopularity);
            })
            .attr("width", xRange.bandwidth() / 2)
            .attr("height", function (d, i) { return height * (parseInt(d[1]) / maxPopularity) })
            .attr("fill", "blue")
            .attr("transform", "translate(" + margins.left + ", 0)")
            .on("mouseover", (d, i) => showBarchartTooltip(d, i, "Democrats"))
            .on("mouseout", hideBarchartTooltip);

        svg.selectAll(".bar_rep")
            .data(repData)
            .enter()
            .append("rect")
            .attr("class", "bar_rep")
            .attr("x", d => xRange(d[0]) + xRange.bandwidth() / 2)
            .attr("y", function (d, i) {
                return margins.top + height * (1 - parseInt(d[1]) / maxPopularity);
            })
            .attr("width", xRange.bandwidth() / 2)
            .attr("height", function (d, i) { return height * (parseInt(d[1]) / maxPopularity) })
            .attr("fill", "red")
            .attr("transform", "translate(" + margins.left + ", 0)")
            .on("mouseover", (d, i) => showBarchartTooltip(d, i, "Republicans"))
            .on("mouseout", hideBarchartTooltip);

        const LEGEND_WIDTH = 40, LEGEND_HEIGHT = 40
        const SQUARE_SIZE = 20

        svg.append("rect")
            .attr("x", width - LEGEND_WIDTH)
            .attr("y", 20)
            .attr("width", SQUARE_SIZE)
            .attr("height", SQUARE_SIZE)
            .style("fill", "red")

        svg.append("rect")
            .attr("x", width - LEGEND_WIDTH)
            .attr("y", 20 + SQUARE_SIZE * 1.2)
            .attr("width", SQUARE_SIZE)
            .attr("height", SQUARE_SIZE)
            .style("fill", "blue")

        svg.append("text")
            .attr("x", width - LEGEND_WIDTH + SQUARE_SIZE + 2)
            .attr("y", 20 + SQUARE_SIZE / 1.25)
            .attr("font-family", "Roboto, sans-serif")
            .attr("font-weight", "400")
            .text("Republicans")

        svg.append("text")
            .attr("x", width - LEGEND_WIDTH + SQUARE_SIZE + 2)
            .attr("y", 20 + SQUARE_SIZE * 1.95)
            .attr("font-family", "Roboto, sans-serif")
            .attr("font-weight", "400")
            .text("Democrats")
    }

    function updateBarchart() {
        const currentYearDemoData = Object.keys(election_results[currentYear]).map(key => [key, election_results[currentYear][key].demo])
        const currentYearRepData = Object.keys(election_results[currentYear]).map(key => [key, election_results[currentYear][key].rep])

        let demoData = popularCountryIndexes.map(index => currentYearDemoData[index])
        let repData = popularCountryIndexes.map(index => currentYearRepData[index])

        svg.selectAll(".bar_demo")
            .transition()
            .attr("y", function (d, i) {
                return margins.top + height * (1 - parseInt(demoData[i][1]) / maxPopularity);
            })
            .attr("height", function (d, i) {
                return height * (parseInt(demoData[i][1]) / maxPopularity)
            })
            .duration(500)

        svg.selectAll(".bar_rep")
            .transition()
            .attr("y", function (d, i) {
                return margins.top + height * (1 - parseInt(repData[i][1]) / maxPopularity);
            })
            .attr("height", function (d, i) {
                return height * (parseInt(repData[i][1]) / maxPopularity)
            })
            .duration(500)
    }

    let slider = document.getElementById("votes_per_state_year_slider");
    let output = document.getElementById("votes_per_state_current_year_container");
    output.innerHTML = "Current year: " + slider.value;

    slider.oninput = function () {
        output.innerHTML = "Current year: " + slider.value;
        currentYear = this.value
        hideBarchartTooltip()
        updateBarchart()
    }


    for (let year = FIRST_YEAR; year <= LAST_YEAR; year += 4) {
        elections_years.push(year)
        election_results[year] = {}

        d3.csv("data/votes" + year + ".csv", function (data) {

            data.forEach(state => {
                election_results[year][state.countryName] = {
                    demo: state.demoVotes,
                    rep: state.repVotes
                }
            })

            filesLoadedCount += 1
            if (filesLoadedCount == NUMBER_OF_ELECTIONS) {
                setupVotesPerStateBarchart()
            }
        })
    }
}

setup_VotesPerStateBlockchart()

window.onresize = function () {
    setup_VotesPerStateBlockchart()
}