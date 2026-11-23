def build_insert_parts(data: dict):
    """
    Build filtered data, column string and value placeholders
    for dynamic INSERT query.

    Returns:
        filtered_data (dict)
        columns (str)
        values (str)
    """

    # Remove None fields
    filtered_data = {
        key: value
        for key, value in data.items()
        if value is not None
    }

    if not filtered_data:
        raise ValueError("No valid fields to insert")

    columns = ", ".join(filtered_data.keys())
    values = ", ".join(f":{key}" for key in filtered_data.keys())

    
    return  filtered_data,columns, values