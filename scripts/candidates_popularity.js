function setup_CandidatesPopularityLinechart() {
    const FIRST_YEAR = 1972, LAST_YEAR = 2020
    const NUMBER_OF_ELECTIONS = (LAST_YEAR - FIRST_YEAR) / 4 + 1

    const ID_CANDIDATES_POPULARITY_LINECHART = "#candidates_popularity_linechart"

    const margins = { top: 10, bottom: 30, right: 30, left: 60 }

    let demo_popularity = {}
    let rep_popularity = {}
    let elections_years = []
    let filesLoadedCount = 0

    let svg;
    let width = 0, height = 0;

    /*
    For the setup of linechart, official material from the course were used
    Chapter 2.3.5. Line Charts
    */
    function setupCandidatePopularityLinechart() {
        const maxPopularity = Math.max(
            Math.max(...Object.keys(demo_popularity).map(key => parseInt(demo_popularity[key]))),
            Math.max(...Object.keys(rep_popularity).map(key => parseInt(rep_popularity[key]))),
        )

        svg = d3.select(ID_CANDIDATES_POPULARITY_LINECHART)
        width = parseInt(svg.style("width").replace("px")) - (margins.left + margins.right)
        height = parseInt(svg.style("height").replace("px")) - (margins.top + margins.bottom)

        let xRange = d3.scaleLinear()
            .range([0, width])
            .domain([FIRST_YEAR, LAST_YEAR])
        let yRange = d3.scaleLinear()
            .range([height, 0])
            .domain([0, maxPopularity])

        let xAxis = d3.axisBottom(xRange)
            .tickFormat(d => d)
            .ticks(NUMBER_OF_ELECTIONS + 1);
        let yAxis = d3.axisLeft(yRange)
            .tickFormat(d => (d / 10000000) + " M");

        svg.selectAll("*").remove()

        svg.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(" + margins.left + "," + (height + margins.top) + ")")
            .call(xAxis)
            .attr("font-size", "1em")

        svg.append("g")
            .attr("class", "y_axis")
            .call(yAxis)
            .attr("transform", "translate(" + margins.left + ", " + margins.top + ")")
            .attr("font-size", "1em")

        let line = d3.line()
            .x((d, i) => margins.left + xRange(elections_years[i]))
            .y((d, i) => margins.bottom + height * (1 - d / maxPopularity))

        svg.append("path")
            .attr("class", "line republicans")
            .attr("d", line(Object.values(rep_popularity)))

        svg.append("path")
            .attr("class", "line democrats")
            .attr("d", line(Object.values(demo_popularity)))


        const LEGEND_WIDTH = 40, LEGEND_HEIGHT = 40
        const SQUARE_SIZE = 20

        svg.append("rect")
            .attr("x", width - LEGEND_WIDTH)
            .attr("y", height - LEGEND_HEIGHT)
            .attr("width", SQUARE_SIZE)
            .attr("height", SQUARE_SIZE)
            .style("fill", "red")

        svg.append("rect")
            .attr("x", width - LEGEND_WIDTH)
            .attr("y", height - LEGEND_HEIGHT + SQUARE_SIZE * 1.2)
            .attr("width", SQUARE_SIZE)
            .attr("height", SQUARE_SIZE)
            .style("fill", "blue")

        svg.append("text")
            .attr("x", width - LEGEND_WIDTH + SQUARE_SIZE + 2)
            .attr("y", height - LEGEND_HEIGHT + SQUARE_SIZE / 1.25)
            .attr("font-family", "Roboto, sans-serif")
            .attr("font-weight", "400")
            .text("Republicans")

        svg.append("text")
            .attr("x", width - LEGEND_WIDTH + SQUARE_SIZE + 2)
            .attr("y", height - LEGEND_HEIGHT + SQUARE_SIZE * 1.95)
            .attr("font-family", "Roboto, sans-serif")
            .attr("font-weight", "400")
            .text("Democrats")
    }

    // Before continuing with the SVG part, all CSVs have to be loaded.
    for (let year = FIRST_YEAR; year <= LAST_YEAR; year += 4) {
        elections_years.push(year)

        d3.csv("data/votes" + year + ".csv", function (data) {
            let totalDemoVotes = 0, totalRepVotes = 0

            data.forEach(element => {
                totalDemoVotes += parseInt(element.demoVotes)
                totalRepVotes += parseInt(element.repVotes)
            });

            demo_popularity[year] = totalDemoVotes
            rep_popularity[year] = totalRepVotes

            filesLoadedCount += 1
            if (filesLoadedCount == NUMBER_OF_ELECTIONS) {
                setupCandidatePopularityLinechart()
            }
        })
    }
}

setup_CandidatesPopularityLinechart()


window.onresize = function () {
    setup_CandidatesPopularityLinechart()
}