from ultralytics import solutions

# 1. create search engine?
app = solutions.SearchApp(
    #data = "image source"
    device="cpu"
)

app.run(debug=True)