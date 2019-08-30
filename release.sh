set -e

#REGISTRY=registry1.gesdisc.eosdis.nasa.gov
REGISTRY=registry1.gesdisc.eosdis.nasa.gov/meditor
IMAGES=( "meditor_ui" "meditor_server" "meditor_proxy" "meditor_notifier" "meditor_replicaset" "meditor_status" )

getLatestFromRepository () {
    echo "Pulling latest from repository to make sure we're up to date..."
    git pull
}

incrementMeditorProjectVersion () {
    echo "\nBumping the version"
    oldversion=`cat VERSION`
    docker run --rm -v "$PWD":/app treeder/bump minor
    version=`cat VERSION`
}

pushMeditorVersionToRepository () {
    version=`cat VERSION`

    git add -A
    git commit -m "release $version"
    git tag -a "$version" -m "release $version"
    git push
    git push --tags
}

promptUserForImagesToRelease() {
    declare -a imagesToDeploy

    PS3="Select an image to release: "
    select opt in "${IMAGES[@]}" "Done"; do 
        case "$REPLY" in
            $(( ${#IMAGES[@]}+1 )) ) break;;
            *) imagesToDeploy+=($opt);;
        esac
    done

    echo "${imagesToDeploy[@]}"
}

getImageLocalDir() {
    # TODO: when these are split into repos the folders should be named the same as the images, then
    # this method can be removed
    case $1 in
        "meditor_ui") localDir=./ui;;
        "meditor_server") localDir=./nodejs-server-server;;
        "meditor_proxy") localDir=./proxy;;
        "meditor_notifier") localDir=./notifier;;
        "meditor_replicaset") localDir=./mongo-replicaset;;
        "meditor_status") localDir=./status;;
        *) localDir="./$1";;
    esac

    echo "${localDir}"
}

getImageCurrentVersion() {
    imageLine=$(grep "image: ${REGISTRY}/${1}:" docker-compose.production.yml | cut "-d " -f2- | xargs)
    version=$(echo "${imageLine/image: $REGISTRY\/$1:/}")
    echo "${version}"
}

getImageNewVersion() {
    currentVersion=$(getImageCurrentVersion $1)
    minorVersion=$(echo "${currentVersion}" | cut -d '.' -f2)
    echo "0.$((minorVersion+1)).0"
}

buildUIDependencies() {
    # temporary hack to get this private repo installing correctly
    cd ./ui
    npm install
    cd ..

    # update visible version number
    # TODO: remove this, get version number from health endpoint
    echo "export const version = '$(getImageNewVersion $1)'" > './ui/src/environments/version.ts'
}

buildImage() {
    BASEDIR=$(dirname "$0")

    newVersion=$(getImageNewVersion $1)

    if [[ $1 = "meditor_ui" ]]
    then
        buildUIDependencies $1
    fi

    localDir=$(getImageLocalDir "$1")

    docker image build -t $REGISTRY/$1 $localDir --no-cache
}

incrementImageVersion() {
    currentVersion=$(getImageCurrentVersion $1)
    newVersion=$(getImageNewVersion $1)

    sed -E "s/${1}:${currentVersion}/${1}:${newVersion}/g" docker-compose.production.yml > docker-compose.production.yml.new \
    && mv docker-compose.production.yml.new docker-compose.production.yml
}

deployImageToRegistry() {
    version=$(getImageCurrentVersion $1)

    docker tag $REGISTRY/$1:latest $REGISTRY/$1:$version
    docker push $REGISTRY/$1:latest
    docker push $REGISTRY/$1:$version
}

main() {
    #getLatestFromRepository
    #incrementMeditorProjectVersion

    echo "\nSelect which image(s) to release\n"

    imagesToDeploy=$(promptUserForImagesToRelease)

    echo "\nThese images will be released: ${imagesToDeploy[@]}.\n"

    read -p "Are you sure? There's no turning back! (y/n) " -n 1 -r
    echo "\n"

    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        for image in $imagesToDeploy
        do
            currentVersion=$(getImageCurrentVersion $image)
            #newVersion=$(getImageNewVersion $image)

            echo "Building $image:$currentVersion"

            buildImage $image
            #incrementImageVersion $image
            deployImageToRegistry $image
        done
    else
        git checkout VERSION
        echo "\nRelease was cancelled."
    fi

    #pushMeditorVersionToRepository
}
 
main "$@"
