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
        // This function takes in a single JSON object for an article/headline
        // It constructs a jQuery element containing all of the formatted HTML for the
        // article card
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
        // We attach the article's id to the jQuery element
        // We will use this when trying to figure out which article the user wants to save
        card.data("_id", article._id);
        // We return the constructed card jQuery element
        return card;
    }

    const renderEmpty = () => {
        artBox.append('No Articles :(');
    }

    const handleArticleSave = function() {
        // This function is triggered when the user wants to save an article
        // When we rendered the article initially, we attached a javascript object containing the headline id
        // to the element using the .data method. Here we retrieve that.
        let articleToSave = $(this)
            .parents(".card")
            .data();

        // Remove card from page
        $(this)
            .parents(".card")
            .remove();

        articleToSave.saved = true;
        // Using a patch method to be semantic since this is an update to an existing record in our collection
        $.ajax({
            method: "PUT",
            url: "/articles/" + articleToSave._id,
            data: articleToSave
        }).then(function (data) {
            // If the data was saved successfully
            if (data.saved) {
                // Run the initPage function again. This will reload the entire list of articles
                init();
            }
        });
    }

    function handleArticleScrape() {
        // This function handles the user clicking any "scrape new article" buttons
        $.get("/scrape").then(function (data) {
            // If we are able to successfully scrape the NYTIMES and compare the articles to those
            // already in our collection, re render the articles on the page
            // and let the user know how many unique articles we were able to save
            init();
            bootbox.alert($("<h3 class='text-center m-top-80'>").text(data.message));
        });
    }

    function handleArticleClear() {
        $.get("api/clear").then(function () {
            articleContainer.empty();
            init();
        });
    }

    $(document).on("click", ".btn.save", handleArticleSave);
    $(document).on("click", ".scrape-new", handleArticleScrape);
    $(".clear").on("click", handleArticleClear);

    init();
});


/*
$(document).ready(() => {
    const artBox = $('.article-container');

    const deleteArticle = function () {
        const articleToDelete = $(this).parents('.card').data();
        $(this).parents('.card').remove();
        $.ajax({
            method: 'DELETE',
            url: `/articles/${articleToDelete._id}`
        }).then(data => { if (data.ok) init() })
            .catch(err => res.json(err));
    }

    const init = () => {
        $.get('/articles?saved=true').then(data => {
            artBox.empty();
            console.log(data);
            if (data && data.length) {
                renderArticles(data);
            } else renderEmpty();
        })
    }

    const renderArticles = articles => {
        const articleCards = articles.map(art => createCard(art));
        artBox.append(articleCards);
    }

    const createCard = article =>
        `<div class='card' data-_id='${article._id}'>
            <div class='card-header'>
                <h3>
                    <a class='article-link' target='_blank' rel='noopener noreferrer' href='${article.url}'>${article.headline}</a>
                    <a class='btn btn-danger delete'>Delete from Saved</a>
                    <a class='btn btn-info notes'>Article Notes</a>
                </h3>
            </div>
            <div class='card-body'>
                ${article.summary}
            </div>
        </div>`;

    const renderEmpty = () => {
        artBox.append('No saved Articles :(');
    }

    const renderNotesList = data => {
        let notesToRender = [];
        if (!data.notes.length) {
            notesToRender.push($(`<li class='list-group-item'>No Notes for this article yet.</li>`));
        } else {
            notesToRender = data.notes.map(note =>
                $(`<li class='list-group-item note'>${note.noteText}<button class='btn btn-danger note-delete'>x</button></li>`));
        }
        $('.note-container').append(notesToRender);
    }



    const addNote = function (event) {
        const currentArticle = $(this).parents('.card').data();

        $.get(`/notes/${currentArticle._id}`).then(data => {
            const modalText = $(`<div class='container-fluid text-center>
            <h4>Notes for Article: ${currentArticle._id}</hr>
            <hr>
            <ul class='light-group note-container'></ul>
            <textarea placeholder='New Note' rows='4' cols='60'></textarea>
            <button class='btn btn-success save'>Save Note</button>`)
        });
        bootbox.dialog({
            message: modalText,
            closeButton: true
        });
        const noteData = {
            _id: currentArticle._id,
            notes: data || []
        };

        $('.btn.save').data('article', noteData);
        renderNotesList(noteData);
    }

    const saveNote = function () {
        let noteData;
        const newNote = $('.bootbox-body textarea').val().trim();
        if (newNote) {
            noteData = { _headlineId: $(this).data('article')._id, noteText: newNote };
            $.post('/notes/', noteData).then(() => bootbox.hideAll());
        }
    }

    const deleteNote = function () {
        const noteToDelete = $(this).data('_id');

        $.ajax({
            method: 'DELETE',
            url: `/notes/${noteToDelete}`
        }).then(() => bootbox.hideAll())
            .catch(err => console.log(err));
    }

    const clearArticles = () => {
        $.get('/clear').then(() => {
            artBox.empty();
            init();
        });
    }

    const scrapeArticles = () => {
        $.get('/scrape').then(() => {
            artBox.empty();
            init();
        }).catch(err => console.log(err));
    }
    $(document).on('click', '.btn.notes', addNote);
    $(document).on('click', '.btn.save', saveNote);
    $(document).on('click', '.btn.note-delete', deleteNote);
    $(document).on('click', '.btn.delete', deleteArticle);
    $(document).on('click', '.scrape-new', scrapeArticles);
    $('.clear').on('click', clearArticles);
})
/*
$.getJSON('/articles', (data) => {
    const articles = data.map(art => `<p data-id='${art._id}'>${art.title}<br />${art.link}</p>`);
    $('#articles').append(articles.join(''));
});

$(document).on('click', 'p', function () {
    $('#notes').empty();
    const thisId = $(this).attr('data-id');

    $.ajax({
        method: 'GET',
        url: `/articles/${thisId}`
    })
        .then(data => {
            $('#notes').append(`
            <h2>${data.title}</h2><input id='titleInput' name='title'>
            <textarea id='bodyInput' name='body'></textarea>
            <button data-id='${data._id}' id='savenote'>Save Note</button>`);

            if (data.note) {
                $('#titleInput').val(data.note.title);
                $('#bodyInput').val(data.note.body);
            }
        })
        .catch(err => console.log(err));
});

$(document).on('click', '#savenote', function () {
    const thisId = $(this).attr('data-id');

    $.ajax({
        method: 'POST',
        url: `/articles/${thisId}`,
        data: {
            title: $('#titleInput').val().trim(),
            body: $('#bodyInput').val().trim()
        }
    })
        .then(data => $('#notes').empty())
        .catch(err => console.log(err));

    $('#titleInput').val('');
    $('#bodyInput').val('');
});
*/