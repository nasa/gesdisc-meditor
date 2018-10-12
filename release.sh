set -ex

REGISTRY=dev.gesdisc.eosdis.nasa.gov:443
IMAGES=( "meditor_ui" "meditor_server" "meditor_database" "meditor_proxy" "meditor_notifier" )

# ensure we're up to date
git pull

# bump version
docker run --rm -v "$PWD":/app treeder/bump minor
version=`cat VERSION`
echo "version: $version"

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