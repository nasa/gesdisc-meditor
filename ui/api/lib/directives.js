const { defaultFieldResolver, GraphQLString } = require('graphql')
const { SchemaDirectiveVisitor } = require('graphql-tools')
const format = require('date-fns/format')
const formatRelative = require('date-fns/formatRelative')
const parseISO = require('date-fns/parseISO')

const dateFormat = format

class FormattableDateDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
        const { resolve = defaultFieldResolver } = field

        field.args.push({
            name: 'format',
            type: GraphQLString,
        })

        field.resolve = async function(source, { format, ...otherArgs }, context, info) {
            const date = await resolve.call(this, source, otherArgs, context, info)

            if (!date || !format) return date

            return format === 'relative' ? 
                formatRelative(typeof date === 'string' ? parseISO(date) : date, new Date()) : 
                dateFormat(typeof date === 'string' ? parseISO(date) : date, format)
        }

        field.type = GraphQLString
    }
}

module.exports.FormattableDateDirective = FormattableDateDirective
