  "scripts": {
    "dev": "cross-env NODE_ENV=development webpack --mode development",
    "build": "cross-env NODE_ENV=production webpack --mode production",
    "watch": "cross-env NODE_ENV=development webpack --mode development --watch",
    "start": "cross-env NODE_ENV=development webpack-dev-server --mode development",
    "stats": "webpack --json > stats.json && webpack-bundle-analyzer stats.json"
  }

  NODE_ENV �� ������ �� ����������� �� �������. cross-env �������� ��� ������.

  dev - ������� ������ � ������ ������������.
  build - ������� ������ ��� ����������.
  watch - ������� ������ � ������ ������������ + �� ���� ������������.
  start - ������� ������ � ������ ������������ + �� ���� ������������ + �� ���� ��������� �������� � ��������.	
  stats - ����������� ����������� ������� �������.