import gzip
from io import BytesIO

def calculate_openai_cost(token_count, rate_per_1000_tokens=0.002):
    """
    Calculate the cost for using a language model based on token usage.
    """
    return token_count / 1000 * rate_per_1000_tokens

def _gunzip_data(data):
    return gzip.GzipFile('', 'r', 0, BytesIO(data)).read()