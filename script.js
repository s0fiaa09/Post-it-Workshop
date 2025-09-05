// Variables principales
const noteInput = document.getElementById('new-note-input');
const addButton = document.getElementById('add-note-button');
const notesContainer = document.getElementById('notes-container');
const toggleThemeButton = document.getElementById('toggle-theme-button');
const body = document.body;

// Solo 3 colores
const colors = ['note-yellow', 'note-blue', 'note-pink'];

// Esta función crea una nueva nota
function createNoteElement(text, colorClass) {
    // Crear el div principal de la nota
    const noteDiv = document.createElement('div');
    noteDiv.classList.add('note', colorClass);
    
    // Crear el texto de la nota
    const textSpan = document.createElement('span');
    textSpan.classList.add('note-text');
    textSpan.textContent = text;
    noteDiv.appendChild(textSpan);

    // Crear el botón X para borrar
    const deleteButton = document.createElement('span');
    deleteButton.classList.add('delete-btn');
    deleteButton.textContent = '×';
    noteDiv.appendChild(deleteButton);

    return noteDiv;
}

// Cargar las notas que están guardadas en el navegador
function loadNotes() {
    try {
        // Buscar si hay notas guardadas
        const storedNotes = localStorage.getItem('notes');
        if (storedNotes) {
            const notes = JSON.parse(storedNotes);
            // Crear cada nota que estaba guardada
            notes.forEach(noteData => {
                if (noteData && noteData.text && noteData.color) {
                    const newNote = createNoteElement(noteData.text, noteData.color);
                    notesContainer.appendChild(newNote);
                }
            });
        }
    } catch (error) {
        console.log('Hubo un problema cargando las notas:', error);
        // Si algo está mal, borrar todo y empezar de nuevo
        localStorage.removeItem('notes');
    }
}

// Guardar todas las notas en el navegador
function saveNotes() {
    try {
        const notes = [];
        // Revisar cada nota que está en pantalla
        const noteElements = notesContainer.children;
        for (let i = 0; i < noteElements.length; i++) {
            const noteElement = noteElements[i];
            if (noteElement.classList.contains('note')) {
                // Sacar el texto de la nota
                const textElement = noteElement.querySelector('.note-text');
                // Sacar el color de la nota
                let colorClass = '';
                for (let j = 0; j < colors.length; j++) {
                    if (noteElement.classList.contains(colors[j])) {
                        colorClass = colors[j];
                        break;
                    }
                }
                
                if (textElement && colorClass) {
                    notes.push({
                        text: textElement.textContent,
                        color: colorClass
                    });
                }
            }
        }
        // Guardar en el navegador
        localStorage.setItem('notes', JSON.stringify(notes));
    } catch (error) {
        console.log('Error guardando las notas:', error);
    }
}

// Configurar el tema (claro u oscuro)
function setInitialTheme() {
    // Ver si el usuario tenía modo oscuro activado
    const isDarkMode = localStorage.getItem('isDarkMode') === 'true';
    if (isDarkMode) {
        body.classList.add('dark-mode');
        toggleThemeButton.textContent = 'Modo Claro';
    }
}

// Cuando el usuario escribe en el input
noteInput.addEventListener('input', () => {
    // Solo activar el botón si hay texto
    addButton.disabled = noteInput.value.trim() === '';
});

// Cuando el usuario presiona Enter en el input
noteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !addButton.disabled) {
        addNote();
    }
});

// Cambiar entre modo claro y oscuro
toggleThemeButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('isDarkMode', isDarkMode);
    toggleThemeButton.textContent = isDarkMode ? 'Modo Claro' : 'Modo Oscuro';
});

// Editar una nota cuando haces doble clic
notesContainer.addEventListener('dblclick', (event) => {
    const noteDiv = event.target.closest('.note');
    // Solo si hiciste clic en una nota y no está siendo editada
    if (noteDiv && !noteDiv.classList.contains('editing')) {
        const textSpan = noteDiv.querySelector('.note-text');
        const currentText = textSpan.textContent;
        noteDiv.classList.add('editing');

        // Crear un área de texto para editar
        const textarea = document.createElement('textarea');
        textarea.value = currentText;
        noteDiv.innerHTML = '';
        noteDiv.appendChild(textarea);
        textarea.focus();

        // Función para terminar de editar
        function saveEdit() {
            const newText = textarea.value.trim();
            noteDiv.classList.remove('editing');
            noteDiv.innerHTML = '';
            
            // Volver a crear el contenido de la nota
            const textSpan = document.createElement('span');
            textSpan.classList.add('note-text');
            textSpan.textContent = newText || 'Nota vacía';
            noteDiv.appendChild(textSpan);
            
            const deleteButton = document.createElement('span');
            deleteButton.classList.add('delete-btn');
            deleteButton.textContent = '×';
            noteDiv.appendChild(deleteButton);

            saveNotes();
        }

        // Guardar cuando haces clic fuera o presionas Enter
        textarea.addEventListener('blur', saveEdit);
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveEdit();
            }
        });
    }
});

// Agregar una nueva nota
function addNote() {
    const noteText = noteInput.value.trim();
    if (noteText === '') return;

    // Escoger un color al azar
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newNote = createNoteElement(noteText, randomColor);
    notesContainer.appendChild(newNote);
    
    // Limpiar el input
    noteInput.value = '';
    addButton.disabled = true;
    
    // Guardar las notas
    saveNotes();
}

// Cuando haces clic en el botón agregar
addButton.addEventListener('click', addNote);

// Borrar una nota cuando haces clic en la X
notesContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
        event.target.parentElement.remove();
        saveNotes();
    }
});

// Inicializar la aplicación cuando la página carga
setInitialTheme();
loadNotes();