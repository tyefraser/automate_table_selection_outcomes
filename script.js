document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('entityInput').addEventListener('keypress', function(event) {
        if (event.key === "Enter") {
            createEntitySection();
            event.preventDefault(); // Prevent form submission
        }
    });

    // Initial call to set up options based on predefined data
    setupInitialOptions();
});

function setupInitialOptions() {
    // This function assumes that 'data' has a generic set of options to be used for any entity
    const select = document.getElementById('initialOptions');
    Object.keys(data).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        select.appendChild(option);
    });
}

function createEntitySection() {
    const input = document.getElementById('entityInput');
    const entityName = input.value.trim();
    if (entityName) { // Ensure the input is not empty
        input.value = ''; // Clear input for next entry
        const container = document.getElementById('entitySectionsContainer');

        // Create the section container
        const section = document.createElement('div');
        section.className = 'entity-section';
        section.style.border = "1px solid #ccc";
        section.style.margin = "10px";
        section.style.padding = "10px";
        section.style.position = "relative";

        // Create the close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.position = 'absolute';
        closeButton.style.right = '10px';
        closeButton.onclick = function() {
            container.removeChild(section);
        };

        // Create the header
        const header = document.createElement('h2');
        header.textContent = entityName;

        // Append elements to the section
        section.appendChild(closeButton);
        section.appendChild(header);

        // Assuming there's a generic set of options applicable to all entities
        const select = document.createElement('select');
        Object.keys(data).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            select.appendChild(option);
        });
        section.appendChild(select);

        container.appendChild(section);
    } else {
        console.error("Empty input for entity name.");
    }
}
