from noise import snoise2
from PIL import Image

SIZE = 256

for i in range(10):
    img = Image.new('L', (SIZE, SIZE))
    pixels = img.load()

    freq = 64
    for x in range(SIZE):
        for y in range(SIZE):
            v = int(snoise2(x / freq, y / freq, 3, base=i) * 127 + 128)
            pixels[x, y] = v
    s = 0
    for x in range(SIZE):
        s += pixels[x, 0]
        s += pixels[x, SIZE - 1]
    for y in range(1, SIZE - 1):
        s += pixels[0, y]
        s += pixels[SIZE - 1, y]
    s /= (255 * 4)
    s = int(s)
    for x in range(SIZE):
        pixels[x, 0] = s
        pixels[x, SIZE - 1] = s
    for y in range(1, SIZE - 1):
        pixels[0, y] = s
        pixels[SIZE - 1, y] = s
    img.save(f'tex{i}.png', 'PNG')
