from ibmroja import answer_questions, inject_roja_instrumentation

# Load runtime variables
APPLICATION_NAME = "james_application"
USER = "James"

inject_roja_instrumentation(APPLICATION_NAME, USER)

questions = [
    'Who proposed the concept of quantization and introduced the idea of energy being emitted in discrete packets or "quanta"?',
    'What is the significance of the uncertainty principle in quantum mechanics?',
    'Which two formulations of quantum mechanics were shown to be mathematically equivalent?',
    'What are some practical applications of quantum mechanics mentioned in the text?',
    'What is the field of study that aims to use quantum systems to simulate and understand complex phenomena?'
]
answer_questions(USER, questions)

print("Done")


