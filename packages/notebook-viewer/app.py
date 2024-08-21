from flask import Flask, request
from urllib.request import urlopen
import nbformat
import urllib.parse
import re
from lib.html_exporter import html_exporter

# only notebooks from these domains are allowed
DOMAIN_WHITELIST_REGEX = "^https://([a-zA-Z0-9]+\.)*(nasa\.gov|github\.com|githubusercontent\.com)\/?.*"

app = Flask('mEditor Notebook Viewer')

@app.route("/meditor/notebookviewer/")
def getNotebookAsHtml():
    return convertNotebookToHtml()


def convertNotebookToHtml():
    # ensure the user passed in a notebook url
    if request.args.get('notebookUrl') == None:
        return "Missing a required URL parameter, `notebookUrl`", 400

    notebookUrl = urllib.parse.unquote(request.args.get('notebookUrl'))

    # ensure the extension is a notebook extension
    if not notebookUrl.endswith('.ipynb'):
        return "URL does not point to a Jupyter Notebook", 400

    # ensure the domain is in the whitelist
    if not re.search(DOMAIN_WHITELIST_REGEX, notebookUrl):
        return "We cannot convert a notebook from the provided domain", 400

    githubUrl = ''
    
    # if we're including a github.com URL, we'll provide some additional links to the original github repo
    if notebookUrl.startswith('https://github.com'):
        # make sure we are only rendering notebooks from the nasa organization
        if not notebookUrl.startswith('https://github.com/nasa/'):
            return "Invalid notebook URL, must be in the NASA organization", 400

        githubUrl = notebookUrl
        notebookUrl = notebookUrl.replace(
            "https://github.com", "https://raw.githubusercontent.com").replace("/blob/", "/")

    # read the notebook content in
    response = urlopen(notebookUrl).read().decode()

    # convert it to HTML
    notebook = nbformat.reads(response, as_version=4)
    (body, resources) = html_exporter.from_notebook_node(notebook, resources={
        'notebookUrl': notebookUrl,
        'githubUrl': githubUrl,
    })

    return body
