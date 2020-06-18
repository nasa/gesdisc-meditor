var _ = require('lodash');
var fetchers = {}; // A registry of various fetch functions

Array.prototype.unique = function() {
    return this.filter(function (value, index, self) { 
      return self.indexOf(value) === index;
    });
};

exports.list = function (dbo,item){
    return new Promise(function(resolve, reject) {
        var [model, field] = item[0].split('.');

        if ( ! model.match(/^\S+$/) ) {
            console.log("Error: collection name in '"+item+"' should not have white spaces");
            throw("Error: collection name in "+item+" should not have white spaces");
        }
        var projection = {"_id":0};
        projection[field] = 1;
        dbo.collection(decodeURIComponent(model)).find({}).project(projection).toArray(function(err,res){
            if (err){
                console.log(err);
                throw(err);
            } else {
                var list = res.map(element=>element[field]);
                resolve(list.unique());
            }
        });
    });   
};

exports.userRoles = function (dbo){
    var roleList = [];
    return new Promise(function(resolve, reject) {
        dbo.collection("Models").aggregate([
            { $lookup:
                {
                    from: "Workflows",
                    localField: "workflow",
                    foreignField: "name",
                    as: "graph"
                }
            },
            { $project:
                {"_id":0, "name":1, "graph.roles":1}
            },
            { $unwind: "$graph" }
        ], {allowDiskUse: true}).toArray(function(err,res){
            if (err){
                console.log(err);
                throw(err);
            }else{
                res.forEach(element=>{
                    roleList = roleList.concat(element.graph.roles);
                });
                resolve(roleList.unique());
            }
        });
    } );
};

// 'Fetchers' are functions registered by name in the 'fetchers' array
// The first element of 'param' should specify the name of a fetcher,
// while the remainder of the param elements are passed to the fetcher
// function
// Fetcher functions can be registered with the module using registerFetchers
exports.fetch = function(dbo, param) {
    var fetcherName;
    if (_.isEmpty(param) || param.length < 1) return Promise.reject('The fetch macro expects one or more parameteres');
    fetcherName = param.shift();
    if (!(fetcherName in fetchers)) return Promise.reject('Unknown fetcher name');
    return fetchers[fetcherName](param);
};
// Registers fetcher functions with the module. Expected format is
// {fetcherName1: fetcherFunctionReference1, fetcherName2: fetcherFunctionReference2, ...}
exports.registerFetchers = function registerFetchers(fetchersParam) {
    _.assign(fetchers, fetchersParam);
};