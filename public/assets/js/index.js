$(document).ready(function () {
    const artBox = $(".article-container");

    const init = () => {
        $.get('/articles?saved=false').then(function(data) {
            artBox.empty();
            if (data && data.length) {
                renderArticles(data);
            } else renderEmpty();
        })
    }

    const renderArticles = articles => {
        const articleCards = articles.map(art => createCard(art));
        artBox.append(articleCards);
    }

    const createCard = article => {
        const card = $("<div class='card'>");
        const cardHeader = $("<div class='card-header'>").append(
            $("<h3>").append(
                $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
                    .attr("href", article.url)
                    .text(article.headline),
                $("<a class='btn btn-success save'>Save Article</a>")
            )
        );
        const cardBody = $("<div class='card-body'>").text(article.summary);
        card.append(cardHeader, cardBody);
        card.data("_id", article._id);
        return card;
    }

    const renderEmpty = () => {
        artBox.append('No Articles :(');
    }

    const handleArticleSave = function() {
        let articleToSave = $(this)
            .parents(".card")
            .data();

        $(this)
            .parents(".card")
            .remove();

        articleToSave.saved = true;
        $.ajax({
            method: "PUT",
            url: "/articles/" + articleToSave._id,
            data: articleToSave
        }).then(function (data) {
            if (data.saved) {
                init();
            }
        });
    }

    function handleArticleScrape() {
        $.get("/scrape").then(function (data) {
            init();
            bootbox.alert($("<h3 class='text-center m-top-80'>").text(data.message));
        });
    }

    const clearArticles = () => {
        $.get('/clear').then(() => {
            artBox.empty();
            init();
        });
    }


    $(document).on("click", ".btn.save", handleArticleSave);
    $(document).on("click", ".scrape-new", handleArticleScrape);
    $(".clear").on("click", clearArticles);

    init();
});