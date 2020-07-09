'use strict'
document.getElementById('search_button').addEventListener("click", getResults)
document.getElementById('search').addEventListener("keydown", e => { if (e.keyCode == '13') {getResults()}})
document.getElementById('getMoreButton').addEventListener("click", () => {getResults(false)})


function getResults(shouldClear = true) {
	let searchValue = document.getElementById('search').value;
	let resultsCount = 0;

	if ( shouldClear ) {
		document.getElementById('results').innerHTML = '';
		document.getElementById('getMoreButton').hidden = true;
	}

	if ( document.getElementsByClassName('resultBlock').length ) {
		resultsCount = document.getElementsByClassName('resultBlock').length;
	}

	fetch(`https://ru.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchValue}&srlimit=10&sroffset=${resultsCount}&format=json&origin=*`)
	.then(response => response.json())
	.then(queryResults => {
		console.log(queryResults);
		if (queryResults.query.searchinfo.totalhits) {
			for (let i = 0; i < 10; i++) {
				createList(queryResults.query.search[i], i);
				fetch(`https://ru.wikipedia.org/w/api.php?action=query&titles=${queryResults.query.search[i].title}&prop=pageimages&format=json&pithumbsize=300&origin=*`)
				.then(response => response.json())
				.then(commit => {
					if (commit.query.pages[Object.keys(commit.query.pages)].thumbnail) {
						let snipImages = [...document.getElementsByClassName('snipImg')];
						snipImages[i+resultsCount].src = commit.query.pages[Object.keys(commit.query.pages)].thumbnail.source;
						snipImages[i+resultsCount].classList = "snipImg";
					}
				})
			}
			document.getElementById('getMoreButton').hidden = false;
		} else {
			document.getElementById('results').insertAdjacentHTML('beforeend', '<img src="icons/notFound.png" style="display: block; margin: 30px auto; animation: fadeIn .5s"/>');
		}
	})
}

	function createList(elemOfList, i) {
			elemOfList = `
					<a href="https://ru.wikipedia.org/wiki/${elemOfList.title}" target="_blank">
						<div class="resultBlock">
							<div class="forImage">
								<img class='snipImg noImage' src="icons/noImage.png"/>
							</div>

							<div class="forInfo">
								<div class="title">
									${elemOfList.title}
								</div>
								<div class="snippet">
									${elemOfList.snippet}
								</div>
								<div class="add_information">
									<div class="reading_time">
									Время чтения: ${calcReadingTime(elemOfList.wordcount)}
									</div>
									<div class="date">
										Редактировалась: ${calcDates(elemOfList.timestamp)}
									</div>
								</div>
							</div>
						</div>
					</a>
						`
			document.getElementById('results').insertAdjacentHTML('beforeend', elemOfList)

		}

function calcReadingTime(wordcount) {
	if ( wordcount/120 > 1 ) {
		return '~' + (wordcount/120).toFixed(0) + ' мин.';
	}
	else
	{
		return 'меньше минуты'
	}
}

function calcDates(state) {
	let timestamp = state;

	let date = new Date(timestamp);
	let day = "0" + date.getDay();
	let month = "0" + (date.getMonth() + 1);
	let year = date.getFullYear();

	let formattedTime = day.substr(-2) + '.' + month.substr(-2) + '.' + year;
	return formattedTime;
}
