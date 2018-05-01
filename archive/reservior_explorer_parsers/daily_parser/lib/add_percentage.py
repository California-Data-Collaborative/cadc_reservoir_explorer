import copy

import parsekit


class percentage(parsekit.Step):

    def run(self, record, metadata):
        schema = copy.deepcopy(metadata.get_closest('schema'))
        if (record[5] == None) |(record[6] == None) | (record[6] == '--') | (record[5] == '--'):
            percentage = None
        else:
            percentage = (float(record[6]) * 100) /float(record[5])
        record.append(str(percentage))
        schema.append_field(parsekit.schema.StringField('Percentage'))
        metadata['schema'] = schema
        return record, metadata
