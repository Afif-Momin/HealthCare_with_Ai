# Retinal-Disease-Detection

Fundus imaging provides physicians with a snapshot of the inside of the patient's eye.
Doctors can read abnormalities present on a patient eye's retinal based on images of its interior.
Many eye diseases can be found using fundus images, such as diabetic retinopathy, glaucoma, and macular degeneration.

This project aims at training a deep learning model to detect different retinal diseases.
This is a multi-label classification problem as a retinal image can have multiple diseases.

The dataset (taken from [this Kaggle competition](https://www.kaggle.com/c/vietai-advance-course-retinal-disease-detection/overview)) includes 3,285 images from CTEH (3.210 abnormals and 75 normals) and 500 normal images from Messidor and EYEPACS dataset.
The abnormalities include: opacity, diabetic retinopathy, glaucoma, macular edema, macular degeneration, and retinal vascular occlusion.