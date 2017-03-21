<!DOCTYPE html>
<html>
    <head>
        <title>Laravel</title>

        <link href="https://fonts.googleapis.com/css?family=Lato:100" rel="stylesheet" type="text/css">

        <style>
            html, body {
                height: 100%;
            }

            body {
                margin: 0;
                padding: 0;
                width: 100%;
                display: table;
                font-weight: 100;
                font-family: 'Lato';
            }

            .container {
                text-align: center;
                display: table-cell;
                vertical-align: middle;
            }

            .content {
                text-align: center;
                display: inline-block;
            }

            .title {
                font-size: 96px;
            }
        </style>

        <script>
            var options = {
                'document' : '',
                'accessToken' : '',
                'env' : 'AutodeskProduction'
            };

            $(document).ready(function () {
                $("#loadTrigger").click(function () {
                    $.ajax({
                        url: opt.address,
                        data: { 'm': 'show3d' },
                        type: 'get',
                        async: true,
                        error: function () {
                            console.log("error when calling" + opt.address);
                        },
                        success: function (res) {
                            console.log(res);
                            if (res == "") {
                                alert("Error: no urn or token");
                            }
                            else {
                                var resObj = eval("("+res+")");//JSON.parse(res);
                                options.document = 'urn:' + resObj.urn;
                                options.accessToken = resObj.token;
                                initialize(options);
                            }
                        }
                    });
                });

            });



            function initialize(options){
                var viewerElement = document.getElementById('viewer');
                //var viewer = new Autodesk.Viewing.GuiViewer3D(viewerElement, {});
                var viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {});

                Autodesk.Viewing.Initializer(options, function () {
                    viewer.start();
                    loadDocument(viewer, options.document);
                });
            }

            function loadDocument(viewer, documentId) {
                // Find the first 3d geometry and load that.
                Autodesk.Viewing.Document.load(documentId, function (doc) {// onLoadCallback
                    var geometryItems = [];
                    geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {
                        'type': 'geometry',
                        'role': '3d'
                    }, true);

                    if (geometryItems.length > 0) {
                        viewer.load(doc.getViewablePath(geometryItems[0]));
                    }
                }, function (errorMsg) {// onErrorCallback
                    alert("Load Error: " + errorMsg);
                });
            }


        </script>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <div class="title">Laravel 5</div>
            </div>
        </div>
    </body>
</html>
