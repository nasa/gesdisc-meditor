from nbconvert import HTMLExporter
from jinja2 import DictLoader

# a custom template for NBConvert to support iframe embedding
dl = DictLoader(
    {
        'custom-template': """
{%- extends 'lab/index.html.j2' -%}

{% block extra_css %}
<base target="_blank" />
{% endblock extra_css %}

{%- block body_header -%}
{% if resources.theme == 'dark' %}
<body class="jp-Notebook" data-jp-theme-light="false" data-jp-theme-name="JupyterLab Dark">
{% else %}
<body class="jp-Notebook" data-jp-theme-light="true" data-jp-theme-name="JupyterLab Light">
{% endif %}

<header style="display: flex; justify-content: flex-end; align-items: center;">
    <nav>
        <a href="{{ resources.notebookUrl }}" title="View Notebook as Code" style="margin-left: 10px;">
            <svg width="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                <path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"/>
            </svg>
        </a>

        {% if resources.githubUrl != '' %}
        <a href="{{ resources.githubUrl }}" title="View on Github" style="margin-left: 10px;">
            <svg width="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/>
            </svg>
        </a>
        {% endif %}

        {% if resources.binderUrl != '' %}
        <a href="https://mybinder.org/v2/gh/{{ resources.binderUrl }}" title="Execute on Binder" style="margin-left: 10px;">
            <svg width="23" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.879 22.481C27.1489 22.481 31.421 18.2089 31.421 12.939C31.421 7.6691 27.1489 3.397 21.879 3.397C16.6091 3.397 12.337 7.6691 12.337 12.939C12.337 18.2089 16.6091 22.481 21.879 22.481Z" stroke="#F5A252" stroke-width="4.8342" stroke-miterlimit="10"/>
                <path d="M21.879 41.042C27.1495 41.042 31.422 36.7695 31.422 31.499C31.422 26.2286 27.1495 21.956 21.879 21.956C16.6085 21.956 12.336 26.2286 12.336 31.499C12.336 36.7695 16.6085 41.042 21.879 41.042Z" stroke="#579ACA" stroke-width="4.8342" stroke-miterlimit="10"/>
                <path d="M12.551 31.832C17.8214 31.832 22.094 27.5595 22.094 22.289C22.094 17.0185 17.8214 12.746 12.551 12.746C7.28054 12.746 3.008 17.0185 3.008 22.289C3.008 27.5595 7.28054 31.832 12.551 31.832Z" stroke="#E66581" stroke-width="4.8342" stroke-miterlimit="10"/>
                <path d="M14.196 25.836C14.955 24.805 15.936 23.909 17.117 23.229C21.683 20.599 27.518 22.169 30.148 26.736" stroke="#579ACA" stroke-width="4.8342" stroke-miterlimit="10"/>
                <path d="M13.61 17.701C10.98 13.135 12.549 7.3 17.117 4.669C21.684 2.039 27.518 3.61 30.148 8.177" stroke="#F5A252" stroke-width="4.8342" stroke-miterlimit="10"/>
            </svg>
        </a>
        {% endif %}
    </nav>
</header>
{%- endblock body_header -%}
"""
    }
)

# create a HTML exporter using our custom template
html_exporter = HTMLExporter(extra_loaders=[dl], template_file='custom-template')
