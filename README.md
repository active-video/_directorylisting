*NOT FOR USE WITH LIGHTTPD OR NGNINX OR OTHER, ONLY APACHE SUPPORTED*

#Apache Directory Browser
This software package is intended to be placed in the root of your web folder, normally /var/www/html, and provides D-PAD navigation of the directory browsing structure (for accessing and browsing a server via a web browser on a mouseless device like a Television browser or CloudTV).

##Installation Instructions
1.  Download the package or "git clone" it into web root
2.  Unzip it so that a folder exists on your server called _directorylisting within the web root, normally `/var/www/html/_directorylisting`
3.  Add a file named `.htaccess` to your webroot or edit the existing one. Alternatively, use the "htaccess.txt" file from the package and move it to the correct location and rename it ".htaccess". (it will appear hidden so ensure you can view hidden files in your FTP client or however you are adding/editing the file).
    ###/var/www/html/.htaccess file contents:

	```
	# SET INDEX OPTIONS
	IndexOptions FancyIndexing FoldersFirst NameWidth=* DescriptionWidth=* HTMLTable XHTML
	# SET DISPLAY ORDER
	IndexOrderDefault Ascending Name
	# SPECIFY HEADER FILE
	HeaderName /_directorylisting/header.html
	# SPECIFY FOOTER FILE
	ReadmeName /_directorylisting/footer.html
	# IGNORE THESE FILES
	IndexIgnore _directorylisting
	```
4.  Locate `httpd.conf`, normally in `/etc/httpd/conf/httpd.conf` and ensure that the "AllowOverride" has a value of "All", and that "Options" has a value of "Indexes FollowSymLinks" as below:
  ```
  <Directory "/var/www/html">
    #the following 2 lines must be present and contain these options and have "AllowOverride All"
    Options Indexes FollowSymLinks
    AllowOverride All
  
    Order allow,deny
    Allow from all
  </Directory>
  

5.  Restart apache
  `sudo /etc/init.d/httpd restart`

Visit your apache site in the browser and you will see a directory listing that is quite pretty and useable with a keyboard Up/Down/Left/Right/Ok
