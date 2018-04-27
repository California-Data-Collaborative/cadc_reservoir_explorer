import parsekit

class dropna(parsekit.Step):

    def run(self, record, metadata):
        schema = metadata.get_closest('schema')
        field_idx = schema.field_index('Dam_ABBR')
        if record[field_idx]:
        	return record, metadata