import gradio as gr

def say_hello(name):
    """
    사용자가 입력한 이름을 받아 실행되는 함수
    """
    return "Hello, " + name

gr_web = gr.Interface(
    fn=say_hello,
    inputs="text",
    outputs="text"
)

gr_web.launch(share=True)