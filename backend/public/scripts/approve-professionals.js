document.addEventListener('click', async event => {
    if (event.target.classList.contains('approve-btn')) {
        const button = event.target;
        const profId = button.dataset.id;

        try {
            const response = await fetch(`/prof/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profId }),
            });

            if (response.ok) {
                button.parentElement.innerHTML =
                    '<span class="approved-text">Approved</span>';
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to approve professional');
            }
        } catch (error) {
            alert('An error occurred while approving the professional.');
        }
    }
});
