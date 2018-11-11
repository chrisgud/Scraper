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

    /*const renderNotesList = data => {
        let notesToRender = [];
        if (!data.notes.length) {
            notesToRender.push($(`<li class='list-group-item'>No Notes for this article yet.</li>`));
        } else {
            notesToRender = data.notes.map(note =>
                $(`<li class='list-group-item note'>${note.noteText}<button class='btn btn-danger note-delete'>x</button></li>`));
        }
        $('.note-container').append(notesToRender);
    }*/
    function renderNotesList(data) {
        // This function handles rendering note list items to our notes modal
        // Setting up an array of notes to render after finished
        // Also setting up a currentNote variable to temporarily store each note
        var notesToRender = [];
        var currentNote;
        if (!data.notes.length) {
            // If we have no notes, just display a message explaining this
            currentNote = $("<li class='list-group-item'>No notes for this article yet.</li>");
            notesToRender.push(currentNote);
        } else {
            // If we do have notes, go through each one
            for (var i = 0; i < data.notes.length; i++) {
                // Constructs an li element to contain our noteText and a delete button
                currentNote = $("<li class='list-group-item note'>")
                    .text(data.notes[i].noteText)
                    .append($("<button class='btn btn-danger note-delete'>x</button>"));
                // Store the note id on the delete button for easy access when trying to delete
                currentNote.children("button").data("_id", data.notes[i]._id);
                // Adding our currentNote to the notesToRender array
                notesToRender.push(currentNote);
            }
        }
        // Now append the notesToRender to the note-container inside the note modal
        $(".note-container").append(notesToRender);
    }


    /*const addNote = function (event) {
        const currentArticle = $(this).parents('.card').data();

        $.get(`/notes/${currentArticle._id}`).then(data => {
            const modalText = $(`<div class='container-fluid text-center>
            <h4>Notes for Article: ${currentArticle._id}</hr>
            <hr>
            <ul class='light-group note-container'></ul>
            <textarea placeholder='New Note' rows='4' cols='60'></textarea>
            <button class='btn btn-success save'>Save Note</button>`);

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
        });
    }*/
    function addNote(event) {
        // This function handles opening the notes modal and displaying our notes
        // We grab the id of the article to get notes for from the card element the delete button sits inside
        var currentArticle = $(this)
            .parents(".card")
            .data();
        // Grab any notes with this headline/article id
        $.get("/notes/" + currentArticle._id).then(function (data) {
            console.log(data);
            // Constructing our initial HTML to add to the notes modal
            var modalText = $("<div class='container-fluid text-center'>").append(
                $("<h4>").text("Notes For Article: " + currentArticle._id),
                $("<hr>"),
                $("<ul class='list-group note-container'>"),
                $("<textarea placeholder='New Note' rows='4' cols='60'>"),
                $("<button class='btn btn-success save'>Save Note</button>")
            );
            // Adding the formatted HTML to the note modal
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
            var noteData = {
                _id: currentArticle._id,
                notes: data || []
            };
            // Adding some information about the article and article notes to the save button for easy access
            // When trying to add a new note
            $(".btn.save").data("article", noteData);
            // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
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