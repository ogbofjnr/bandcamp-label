
.PHONY: zip

zip:
	cd src && rm -rf archive.zip && zip -r archive.zip ./*