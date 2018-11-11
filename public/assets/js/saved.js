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

    function renderNotesList(data) {
        var notesToRender = [];
        var currentNote;
        if (!data.notes.length) {
            currentNote = $("<li class='list-group-item'>No notes for this article yet.</li>");
            notesToRender.push(currentNote);
        } else {
            for (var i = 0; i < data.notes.length; i++) {
                currentNote = $("<li class='list-group-item note'>")
                    .text(data.notes[i].noteText)
                    .append($("<button class='btn btn-danger note-delete'>x</button>"));
                currentNote.children("button").data("_id", data.notes[i]._id);
                notesToRender.push(currentNote);
            }
        }
        $(".note-container").append(notesToRender);
    }

    function addNote(event) {
        var currentArticle = $(this)
            .parents(".card")
            .data();
        $.get("/notes/" + currentArticle._id).then(function (data) {
            console.log(data);
            var modalText = $("<div class='container-fluid text-center'>").append(
                $("<h4>").text("Notes For Article: " + currentArticle._id),
                $("<hr>"),
                $("<ul class='list-group note-container'>"),
                $("<textarea placeholder='New Note' rows='4' cols='60'>"),
                $("<button class='btn btn-success save'>Save Note</button>")
            );
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
            var noteData = {
                _id: currentArticle._id,
                notes: data || []
            };
            $(".btn.save").data("article", noteData);
            renderNotesList(noteData);
        });
    }

    const saveNote = function () {
        let noteData;
        const newNote = $('.bootbox-body textarea').val().trim();
        if (newNote) {
            noteData = { _headlineId: $(this).data('article')._id, noteText: newNote };
            $.post('/notes/', noteData).then(() => bootbox.hideAll());
        }
    }

    function deleteNote () {
        const noteToDelete = $(this).data('_id');

        $.ajax({
            method: 'DELETE',
            url: `/notes/${noteToDelete}`
        }).then(function () {
            console.log('wtf!!!');
            bootbox.hideAll()
        }).catch(err => console.log(err));
    }

    const clearArticles = () => {
        $.get('/clear').then(() => {
            artBox.empty();
            init();
        });
    }

    $(document).on('click', '.btn.notes', addNote);
    $(document).on('click', '.btn.save', saveNote);
    $(document).on('click', '.btn.note-delete', deleteNote);
    $(document).on('click', '.btn.delete', deleteArticle);
    $('.clear').on('click', clearArticles);

    init();
});