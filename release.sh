set -ex

REGISTRY=dev.gesdisc.eosdis.nasa.gov:443
IMAGES=( "meditor_ui" "meditor_server" "meditor_proxy" "meditor_notifier" "meditor_replicaset" "meditor_status" )

# ensure we're up to date
git pull

# bump version
oldversion=`cat VERSION`
docker run --rm -v "$PWD":/app treeder/bump minor
version=`cat VERSION`
echo "version: $version"

# modify docker-compose to use version
sed -i '' "s/$oldversion/$version/g" docker-compose.production.yml

# run build
./build.sh

# git tag and push
git add -A
git commit -m "release $version"
git tag -a "$version" -m "release $version"
git push
git push --tags

# docker tag and push
for image in "${IMAGES[@]}"
do
    docker tag $REGISTRY/$image:latest $REGISTRY/$image:$version
    docker push $REGISTRY/$image:latest
    docker push $REGISTRY/$image:$version
done