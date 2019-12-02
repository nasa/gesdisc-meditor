// mongo < uui-content-cleanup.js 
var host = "localhost:27017";
var conn = new Mongo(host);
var dbName = "uui-db";
var use_auth = false;
var db = conn.getDB('admin');
if (use_auth) db.auth("admin", "");
db = conn.getDB(dbName);

var contentTypes = ['alerts', 'documents', 'faqs', 'glossary', 'howto', 'images', 'news', 'publications', 'tools'];
var fileBasedTypes = ['images', 'news', 'tools'];
var contentRequiresImage = ['news'];
var groups = {
    howto: [
        'Worldview', 'Giovanni', 'ArcGIS', 'R', 'GrADS', 'HDFView', 'Panoply', 'IDV',
        'McIDAS-V', 'Matlab', 'IDL', 'ENVI', 'Python', 'NCO', 'CHANGE Viewer', 'Excel',
        'ncBrowse', 'grid', 'swath', 'point', 'shapefile', 'vector', 'read data', 'visualization',
        'format', 'conversion', 'spatial subsetting', 'HDF4', 'HDF5', 'netCDF', 'netCDF4', 'HDF-EOS',
        'HDF-EOS5', 'GRIB', 'Binary', 'ASCII', 'CVS', 'GeoTiff'
    ],
    faqs: [ 'A-Train', 'ACOS', 'AIRS', 'Atmospheric Composition', 'CMS', 'Data Rods', 'FLDAS',
        'GDS', 'Giovanni', 'GLDAS', 'GPM', 'HIRDLS', 'Hydrology', 'LIMS', 'LPRM', 'MDISC',
        'MERRA', 'MERRA-2', 'MEaSUREs', 'Mirador', 'MLS', 'MSU', 'NEESPI', 'NEWS', 'NLDAS',
        'OCO-2', 'OMI', 'OMPS', 'OPeNDAP', 'Precipitation', 'SBUV', 'Services', 'SORCE',
        'SSBUV', 'SSW', 'TCTE', 'TOMS', 'TRMM', 'UARS', 'General Questions'
    ]
};
var arrFields = ['tags', 'datasets'];

var PLACEHOLDER_IMG_TITLE = 'Placeholder image';
var PLACEHOLDER_IMG_CAPTION = 'No image available for the document';
var placeholderImgDoc = db.images.findOne({title: PLACEHOLDER_IMG_TITLE});

print('Removing groups from images');
db.images.update({}, {$unset: {groups: 1}}, {multi: true});
contentTypes.forEach(function(contentType) {
	print('Processing: ', contentType);
	db[contentType].find({}).forEach(function(doc) {
        var changed = false;
        arrFields.forEach(function(arrField) {
            if (!doc[arrField]) {
                changed = true;
                doc[arrField] = [];
                print('Added empty array field');
            } else if (typeof doc[arrField] === "string") {
                doc[arrField] = (doc[arrField] !== "") ? [doc[arrField]] : []; 
                changed = true;
                print('Converted array field');
            };
        })
		if (fileBasedTypes.indexOf(contentType) !== -1 && (!doc.abstract || doc.abstract === "")) {
            doc.abstract = doc.title;
            print('Set abstract to title');
            changed = true;
        };
        if ('groups' in doc && contentType in groups) {
            doc.groups.forEach(function(g) {
                if (groups[contentType].indexOf(g) === -1) {
                    print('Invalid tag:[' + g + '] in', doc.title);
                }
            })
        }
        if (contentRequiresImage.indexOf(contentType) !== -1 && (!doc.image && (!doc.fileRef || doc.fileRef === {}))) {
            changed = true;
            doc.fileRef = placeholderImgDoc.fileRef;
            doc.imageCaption = placeholderImgDoc.abstract;
            print('Added placeholder image');
        }
        if (contentRequiresImage.indexOf(contentType) !== -1 && (!doc.imageCaption || doc.imageCaption === '')) {
            changed = true;
            doc.imageCaption = "No caption available for the image";
            print('Added empty title');
        }
		if (changed) {
            // print('Updating ', contentType, ':', doc.title);
            db[contentType].update({_id: doc._id}, {$set: doc});
        }
	});
});