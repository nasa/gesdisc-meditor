const template = `<details class="jupyter-notebook-embed" open>
    <summary class="mb-0 p-3">
        <span class="h6 ml-3">{{ title }}</h3>
    </summary>

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
    /* some very sparse coloring, keeping this as minimal as possible so the website using it can decide how to style it */
    background-color: rgba(0,0,0,.03);  
    border-bottom: 1px solid rgba(0,0,0,.125);
}
</style>`

export default template
