document.addEventListener("DOMContentLoaded", function() {
    const submitButton = document.getElementById("submit-article");
    const articleTitle = document.getElementById("article-title");
    const articleContent = document.getElementById("article-content");
    const articlesContainer = document.getElementById("articles");

    // Charger les articles existants au chargement de la page
    loadArticlesFromGitHub();

    submitButton.addEventListener("click", function() {
        const title = articleTitle.value;
        const content = articleContent.value;

        if (title && content) {
            // Créer un nouvel article
            const article = createArticle(title, content);
            
            // Ajouter le nouvel article au début de la liste des articles
            articlesContainer.insertBefore(article, articlesContainer.firstChild);

            // Sauvegarder l'article sur GitHub
            saveArticleToGitHub(title, content);

            // Réinitialiser les champs du formulaire
            articleTitle.value = "";
            articleContent.value = "";
        } else {
            alert("Veuillez remplir tous les champs.");
        }
    });

    function createArticle(title, content) {
        const article = document.createElement("article");
        const articleTitle = document.createElement("h2");
        const articleContent = document.createElement("p");

        // Utiliser textContent pour éviter les problèmes d'encodage des caractères spéciaux
        articleTitle.textContent = title;
        articleContent.textContent = content;

        article.appendChild(articleTitle);
        article.appendChild(articleContent);

        return article;
    }

    function saveArticleToGitHub(title, content) {
        const accessToken = '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';
        const repoOwner = 'Azzzeuh';
        const repoName = 'docker-sae203';
        const filePath = `articles/${Date.now()}.json`; // Choisir un chemin de fichier approprié
        const commitMessage = 'Ajout d\'un nouvel article';

        const articleData = JSON.stringify({ title, content });

        // Utiliser encodeURIComponent pour encoder les caractères spéciaux dans l'URL
        fetch(`https://api.github.com/repos/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}/contents/${encodeURIComponent(filePath)}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: commitMessage,
                content: btoa(unescape(encodeURIComponent(articleData))), // Convertir les données en base64
            }),
        })
        .then(response => {
            if (response.ok) {
                console.log('Article ajouté avec succès sur GitHub !');
            } else {
                console.error('Erreur lors de l\'ajout de l\'article sur GitHub :', response.statusText);
            }
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout de l\'article sur GitHub :', error);
        });
    }

    function loadArticlesFromGitHub() {
        const repoOwner = 'Azzzeuh';
        const repoName = 'docker-sae203';

        fetch(`https://api.github.com/repos/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}/contents/articles`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Impossible de charger les articles depuis GitHub');
                }
            })
            .then(data => {
                // Charger les articles depuis GitHub et les afficher sur la page
                data.forEach(article => {
                    const { name, download_url } = article;
                    fetch(download_url)
                        .then(response => response.json())
                        .then(articleData => {
                            const newArticle = createArticle(articleData.title, articleData.content);
                            articlesContainer.appendChild(newArticle);
                        });
                });
            })
            .catch(error => {
                console.error(error);
            });
    }
});
