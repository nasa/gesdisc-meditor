const template = `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

<details class="jupyter-notebook-embed" open>
    <summary class="mb-0 p-3">
        <span class="h6 ml-3">{{ title }}</h3>
    </summary>
    <div>
    <a href="https://docserver.gesdisc.eosdis.nasa.gov/public/project/notebooks/How_To_Access_MERRA2_Using_OPeNDAP_with_Python3_Calculate_Weekly_from_Hourly.ipynb" title="Download locally" target="_blank">
        <i style="font-size:28px" class="fa">&#xf019;</i>
    </a>
    <a href="https://github.com/nasa/gesdisc-tutorials/blob/main/notebooks/How_to_Use_the_Web_Services_API_for_Dataset_Searching.ipynb" title="View on GitHub" target="_blank">
          <i style="font-size:30px" class="fa">&#xf09b;</i>
        </a>
    </div>
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
a{
    margin:10px;
    color: #777;
}
div a{
    float:right;
}
</style>`

export default template
