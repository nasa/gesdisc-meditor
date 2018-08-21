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
        dbo.collection(model).find({}).project(projection).toArray(function(err,res){
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
        ]).toArray(function(err,res){
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
