import { createDocument, getDocumentsForModel } from 'documents/service'
import type { NextApiRequest, NextApiResponse } from 'next'
import { respondAsJson } from 'utils/api'
import { ErrorCode, HttpException, apiError } from 'utils/errors'
import { safeParseJSON } from 'utils/json'
import jsonMapper from 'json-mapper-json'

const COLLECTION_METADATA = 'Collection Metadata'
const EARTHDATA_PUB_STATE = 'From EarthdataPub' // must match the state defined in the "Collection Metadata" workflow

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const uuid = decodeURIComponent(req.query.uuid.toString())

    if (
        !process.env.EARTHDATA_PUB_API_KEY ||
        uuid !== process.env.EARTHDATA_PUB_API_KEY
    ) {
        return apiError(
            new HttpException(ErrorCode.Unauthorized, 'Provided token is invalid'),
            res
        )
    }

    switch (req.method) {
        case 'GET': {
            const [error, documents] = await getDocumentsForModel(
                COLLECTION_METADATA,
                {
                    // only return EDPub uploaded collections
                    filter: `state="${EARTHDATA_PUB_STATE}"`,
                }
            )

            if (error) {
                return apiError(error, res)
            }

            return respondAsJson(documents, req, res)
        }

        case 'POST': {
            if (!req.body) {
                return apiError(
                    new HttpException(
                        ErrorCode.BadRequest,
                        'Please provide a UMM-C document in JSON format'
                    ),
                    res
                )
            }

            const [parsingError, parsedUmmC] = safeParseJSON(req.body)

            if (parsingError) {
                return apiError(parsingError, res)
            }

            // map UMM-C to Collection Metadata
            const [mappingError, mEditorCollection] =
                await mapEDPubUmmCToMeditorCollection(parsedUmmC)

            if (mappingError) {
                return apiError(mappingError, res)
            }

            const [createDocumentError, createdDocument] = await createDocument(
                mEditorCollection,
                COLLECTION_METADATA,
                {
                    uid: 'earthdatapub', // provide a fake user id
                } as any,
                EARTHDATA_PUB_STATE
            )

            if (createDocumentError) {
                return apiError(createDocumentError, res)
            }

            return respondAsJson(createdDocument, req, res)
        }

        default:
            return res.status(405).end()
    }
}

/**
 * Maps a partial UMM-C document, received from Earthdata Pub, to a mEditor "Collection Metadata" format
 * Note: this ONLY maps the fields that Earthdata Pub uses, NOT the whole UMM-C document
 */
async function mapEDPubUmmCToMeditorCollection(eDPubPartialUmmC: any) {
    if (!eDPubPartialUmmC.ShortName || !eDPubPartialUmmC.Version) {
        throw new HttpException(
            ErrorCode.BadRequest,
            'Collection ShortName and Version are required'
        )
    }

    const combinedEntryID = `${eDPubPartialUmmC.ShortName}_${eDPubPartialUmmC.Version}`

    try {
        return [
            null,
            await jsonMapper(eDPubPartialUmmC, {
                Combined_EntryID: {
                    path: '$item',
                    formatting: () => combinedEntryID,
                },
                Entry_ID: {
                    path: '$item',
                    nested: {
                        Short_Name: {
                            path: 'ShortName',
                        },
                        Version: {
                            path: 'Version',
                        },
                    },
                },
                Entry_Title: {
                    path: 'EntryTitle',
                    required: false,
                },
                Product_Level_Id: {
                    path: 'ProcessingLevel.Id',
                    required: false,
                },
                Summary: {
                    required: false,
                    path: '$item',
                    nested: {
                        Abstract: {
                            path: 'Abstract',
                            required: false,
                        },
                    },
                },
                Dataset_Citation: {
                    path: '$item',
                    required: false,
                    formatting: async (ummc: any) => {
                        return [
                            await jsonMapper(ummc, {
                                Dataset_Title: {
                                    path: 'EntryTitle',
                                    required: false,
                                },
                                Dataset_Series_Name: {
                                    path: 'ShortName',
                                },
                                Version: {
                                    path: 'Version',
                                },
                                Dataset_Publisher: {
                                    path: '$item',
                                    formatting: () =>
                                        'Goddard Earth Sciences Data and Information Services Center (GES DISC)',
                                },
                                Persistent_Identifier: {
                                    required: false,
                                    path: 'DOI',
                                    formatting: (doi: any) => {
                                        if (doi?.DOI) {
                                            return {
                                                Type: 'DOI',
                                                HasDOI: true,
                                                Identifier: doi.DOI,
                                            }
                                        } else {
                                            // if we don't have a DOI provided, we should include a missing reason or explanation, however both fields are optional
                                            return {
                                                HasDOI: false,
                                                ...(doi?.MissingReason && {
                                                    MissingReason: doi.MissingReason,
                                                }),
                                                ...(doi?.Explanation && {
                                                    Explanation: doi.Explanation,
                                                }),
                                            }
                                        }
                                    },
                                },
                            }),
                        ]
                    },
                },
                Temporal_Coverage: {
                    required: false,
                    path: 'TemporalExtents',
                    formatting: async (extents: any[]) => {
                        if (!extents?.length) {
                            // optional field
                            return
                        }

                        return await jsonMapper(extents, {
                            Range_DateTime: {
                                path: 'RangeDateTimes',
                                nested: {
                                    Beginning_Date_Time: {
                                        path: 'BeginningDateTime',
                                        required: false,
                                    },
                                    Ending_Date_Time: {
                                        path: 'BeginningDateTime',
                                        required: false,
                                    },
                                },
                            },
                            Ends_At_Present_Flag: {
                                path: 'EndsAtPresentFlag',
                                required: false,
                            },
                        })
                    },
                },
                Spatial_Coverage: {
                    path: 'SpatialExtent',
                    required: false,
                    nested: {
                        Geometry: {
                            path: 'Geometry',
                            required: false,
                            nested: {
                                Bounding_Rectangle: {
                                    path: 'BoundingRectangles',
                                    required: false,
                                    nested: {
                                        Southernmost_Latitude: {
                                            path: 'SouthBoundingCoordinate',
                                            required: false,
                                        },
                                        Northernmost_Latitude: {
                                            path: 'NorthBoundingCoordinate',
                                            required: false,
                                        },
                                        Westernmost_Longitude: {
                                            path: 'WestBoundingCoordinate',
                                            required: false,
                                        },
                                        Easternmost_Longitude: {
                                            path: 'EastBoundingCoordinate',
                                            required: false,
                                        },
                                    },
                                },
                            },
                        },
                        Granule_Spatial_Representation: {
                            path: 'GranuleSpatialRepresentation',
                            required: false,
                        },
                    },
                },
                Metadata_Dates: {
                    path: 'MetadataDates',
                    required: false,
                    formatting: (dates: any) => {
                        const creationDate = dates?.find(
                            date => date.Type === 'CREATE'
                        )?.Date
                        const updatedDate = dates?.find(
                            date => date.Type === 'UPDATE'
                        )?.Date

                        if (!creationDate) {
                            return undefined // removes metadata dates from the Collection Metadata
                        }

                        return {
                            Metadata_Creation: creationDate.toString(),
                            Data_Creation: creationDate.toString(),
                            Metadata_Last_Revision: (
                                updatedDate ?? creationDate
                            ).toString(),
                            Data_Last_Revision: (
                                updatedDate ?? creationDate
                            ).toString(),
                        }
                    },
                },
                Personnel: {
                    path: 'ContactPersons',
                    required: false,
                    formatting: (persons: any) => {
                        return (
                            persons?.map(person => ({
                                Role: person.Roles,
                                Personnel_Type: 'Contact_Person', // TODO: EDPub only sends contact persons, but this field also supports contact groups
                                Contact_Person: [
                                    {
                                        First_Name: person.FirstName,
                                        Last_Name: person.LastName,
                                        // a person can optionally have multiple addresses
                                        ...(person.ContactInformation?.Addresses
                                            ?.length && {
                                            Address:
                                                person.ContactInformation.Addresses.map(
                                                    address => ({
                                                        Street_Address:
                                                            address.StreetAddresses,
                                                        City: address.City,
                                                        State_Province:
                                                            address.StateProvince,
                                                        Postal_Code:
                                                            address.PostalCode,
                                                        Country: address.Country,
                                                    })
                                                ),
                                        }),
                                        // TODO: Edpub only sends addresses, but UMM-C supports Phones and Emails as well
                                    },
                                ],
                            })) ?? undefined
                        )
                    },
                },
            }),
        ]
    } catch (err) {
        return [new HttpException(ErrorCode.BadRequest, err.message), null]
    }
}
