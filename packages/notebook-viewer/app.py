from flask import Flask, request
from urllib.request import build_opener, HTTPRedirectHandler
import nbformat
import urllib.parse
import os.path
import re
from lib.html_exporter import html_exporter


app = Flask("mEditor Notebook Viewer")


@app.route("/meditor/notebookviewer/")
def getNotebookAsHtml():
    return convertNotebookToHtml()

class SafeRedirectHandler(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not is_allowed(newurl):
            raise ValueError("Redirect destination is not allowed")

        return super().redirect_request(
            req, fp, code, msg, headers, newurl
        )

def convertNotebookToHtml():
    # ensure the user passed in a notebook url
    if request.args.get("notebookUrl") is None:
        return "Missing a required URL parameter, `notebookUrl`", 400

    notebookUrl = request.args.get("notebookUrl")

    # ensure the extension is a notebook extension
    if not notebookUrl.endswith(".ipynb"):
        return "URL does not point to a Jupyter Notebook", 400

    # ensure the domain is in the whitelist
    if not is_allowed(notebookUrl):
        return "We cannot convert a notebook from the provided domain", 400

    githubUrl = ""

    # if we're including a github.com URL, we'll provide some additional links to the original github repo
    if notebookUrl.startswith("https://github.com"):
        githubUrl = notebookUrl
        notebookUrl = notebookUrl.replace(
            "https://github.com", "https://raw.githubusercontent.com"
        ).replace("/blob/", "/")

      # Fetch using redirect validation
    try:
        opener = build_opener(SafeRedirectHandler())
        response = opener.open(notebookUrl).read().decode()
    except Exception:
        return "Unable to retrieve the notebook", 400

    # convert it to HTML
    try:
        notebook = nbformat.reads(response, as_version=4)

        (body, _resources) = html_exporter.from_notebook_node(
            notebook,
            resources={
                "notebookUrl": notebookUrl,
                "githubUrl": githubUrl,
            },
        )
    except Exception:
        return "Unable to process the notebook", 400

    return body

def is_allowed(url: str) -> bool:
    try:
        u = urllib.parse.urlsplit(url)
    except ValueError:
        return False

    if u.scheme != "https":
        return False

    if u.username or u.password:
        return False

    host = (u.hostname or "").rstrip(".").lower()
    path = u.path

    # Reject dot-segment traversal and encoded dot segments
    lower_path = path.lower()

    if (
        "/../" in lower_path
        or "/./" in lower_path
        or lower_path.endswith("/..")
        or lower_path.endswith("/.")
        or "%2e" in lower_path
    ):
        return False

    if host == "nasa.gov" or host.endswith(".nasa.gov"):
        return True

    if host == "github.com":
        parts = path.split("/")

        return (
            len(parts) >= 2
            and parts[1].lower() == "nasa"
        )

    if host == "raw.githubusercontent.com":
        parts = path.split("/")

        return (
            len(parts) >= 2
            and parts[1].lower() == "nasa"
        )

    return False