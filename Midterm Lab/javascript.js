const pictureDiv = document.getElementById('picturediv');
const tooltip = document.getElementById('tooltip');
const intro = document.getElementById('intro');

pictureDiv.addEventListener('mouseover', () => {
    tooltip.style.display = 'block'; // Show the tooltip
});

pictureDiv.addEventListener('mouseout', () => {
    tooltip.style.display = 'none'; // Hide the tooltip
});

pictureDiv.addEventListener('click', () => {
    // Toggle the visibility of the introduction message
    if (intro.style.display === 'none' || intro.style.display === '') {
        intro.style.display = 'block'; // Show the intro
    } else {
        intro.style.display = 'none'; // Hide the intro
    }
});