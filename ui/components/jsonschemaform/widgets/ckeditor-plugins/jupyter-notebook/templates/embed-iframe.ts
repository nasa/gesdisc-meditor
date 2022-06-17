const template = `<details class="jupyter-notebook-embed" open>
    <summary><h3>{{ title }}</h3></summary>

    <iframe
        src="{{ url }}"
        width="100%"
        height="500"
        frameborder="0"
        allowfullscreen
    ></iframe>
</details>

<style>
details.jupyter-notebook-embed summary {
    cursor: pointer;
    padding: 0.75rem 1.25rem;
    margin-bottom: 0;
    background-color: rgba(0,0,0,.03);
    border-bottom: 1px solid rgba(0,0,0,.125);
}

details.jupyter-notebook-embed summary h3 {
    margin-left: 20px;
}

details.jupyter-notebook-embed summary > * {
    display: inline;
}
</style>`

export default template
