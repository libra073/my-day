import glob, os
from PIL import Image, ImageDraw
files = sorted(glob.glob(r"C:\Users\libra051099\.gemini\antigravity-ide\scratch\my-day\public\portfolio\*.jpg"))
cols, cell = 4, 330
rows = (len(files)+cols-1)//cols
sheet = Image.new("RGB", (cols*cell, rows*(cell+24)), (250,250,252))
d = ImageDraw.Draw(sheet)
for i,f in enumerate(files):
    im = Image.open(f).convert("RGB"); im.thumbnail((cell-10, cell-10))
    x = (i%cols)*cell + (cell-im.width)//2; y = (i//cols)*(cell+24) + (cell-im.height)//2
    sheet.paste(im, (x,y)); d.text(((i%cols)*cell+6, (i//cols)*(cell+24)+cell+4), os.path.basename(f)[:34], fill=(20,20,30))
out = r"C:\Users\libra051099\OneDrive\Documents\deepseek-harness\default-workspace\candidates\picked.png"; sheet.save(out); print(out, sheet.size)
